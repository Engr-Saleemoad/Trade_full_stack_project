import express from 'express';
import mongoose from 'mongoose';
import Deposit from '../models/Deposit.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { adminProtect } from '../middleware/authMiddleware.js';
import { emitRealtimeEvent } from '../socket.js';
import { distributeReferralCommissions } from '../utils/referralBonus.js';

const router = express.Router();

// Seed/Default fallback dev deposit requests if DB is empty or in dev mode
const seedDevDeposits = [
  {
    _id: 'dep_req_001',
    userId: 'default_test_john_123',
    user: {
      username: 'john',
      email: 'john@example.com',
    },
    transactionId: '09KBCBGZ8FU4',
    gatewayType: 'USDT ( BEP 20 )',
    walletAddress: '0x86A04560103588BFA89B478E09F6d89C0C858eEB',
    requestedAmount: 100.0,
    proofImage: '/uploads/sample_proof_1.jpg',
    status: 'Pending',
    createdAt: new Date('2026-07-20T15:29:00Z').toISOString(),
  },
  {
    _id: 'dep_req_002',
    userId: 'user_luca_99',
    user: {
      username: 'lucagracia',
      email: 'luca@gmail.com',
    },
    transactionId: 'TX7782A09B11',
    gatewayType: 'USDT ( TRC 20 )',
    walletAddress: 'TYD92hKn81gH7sKqL93kJsLq',
    requestedAmount: 500.0,
    proofImage: '/uploads/sample_proof_2.jpg',
    status: 'Approved',
    createdAt: new Date('2026-07-19T11:15:00Z').toISOString(),
  },
  {
    _id: 'dep_req_003',
    userId: 'default_test_john_123',
    user: {
      username: 'john',
      email: 'john@example.com',
    },
    transactionId: 'TX1102938475',
    gatewayType: 'USDT ( BEP 20 )',
    walletAddress: '0x86A04560103588BFA89B478E09F6d89C0C858eEB',
    requestedAmount: 250.0,
    proofImage: '/uploads/sample_proof_3.jpg',
    status: 'Rejected',
    createdAt: new Date('2026-07-18T09:40:00Z').toISOString(),
  },
];

// In-memory dev storage mutable array for live action updates when MongoDB is offline
let devDepositsState = [...seedDevDeposits];

/**
 * @desc    Get all deposit requests for Admin Portal
 * @route   GET /api/admin/deposits
 * @access  Private (Admin Only)
 */
export const getAdminDeposits = async (req, res, next) => {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      // Retrieve all deposit records populated with user details (username, email)
      let deposits = await Deposit.find()
        .sort({ createdAt: -1 })
        .lean();

      // Populate user details manually or formatted
      const populatedDeposits = await Promise.all(
        deposits.map(async (dep) => {
          let userObj = { username: 'Unknown User', email: 'N/A' };
          if (dep.userId) {
            try {
              const u = await User.findById(dep.userId).select('username email').lean();
              if (u) {
                userObj = { username: u.username, email: u.email };
              } else if (typeof dep.userId === 'object' && dep.userId.username) {
                userObj = { username: dep.userId.username, email: dep.userId.email };
              }
            } catch (err) {
              const u = await User.findOne({
                $or: [{ _id: dep.userId }, { username: dep.userId }],
              })
                .select('username email')
                .lean();
              if (u) {
                userObj = { username: u.username, email: u.email };
              }
            }
          }

          const txId =
            dep.transactionId ||
            (dep._id ? dep._id.toString().substring(0, 12).toUpperCase() : 'TX' + Date.now());

          return {
            ...dep,
            _id: dep._id.toString(),
            transactionId: txId,
            user: userObj,
          };
        })
      );

      return res.status(200).json({
        success: true,
        count: populatedDeposits.length,
        data: populatedDeposits,
      });
    } else {
      console.warn('[Admin Deposit] MongoDB offline. Returning dev state deposit requests.');
      return res.status(200).json({
        success: true,
        count: devDepositsState.length,
        data: devDepositsState,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve deposit request & atomically credit user balance
 * @route   PUT /api/admin/deposits/approve/:id
 * @access  Private (Admin Only)
 */
export const approveDeposit = async (req, res, next) => {
  try {
    const depositId = req.params.id;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected && mongoose.Types.ObjectId.isValid(depositId)) {
      const deposit = await Deposit.findById(depositId);

      if (!deposit) {
        return res.status(404).json({ error: 'Deposit request record not found.' });
      }

      if (deposit.status === 'Approved') {
        return res.status(400).json({ error: 'This deposit has already been approved.' });
      }

      // Update deposit status to "Approved"
      deposit.status = 'Approved';
      await deposit.save();

      const amountToCredit = Number(deposit.requestedAmount) || 0;

      // Atomic Balance Update: Use MongoDB $inc to directly increase user mainBalance & totalDeposit
      let updatedUser = null;
      if (deposit.userId) {
        try {
          updatedUser = await User.findByIdAndUpdate(
            deposit.userId,
            {
              $inc: {
                mainBalance: amountToCredit,
                totalDeposit: amountToCredit,
              },
            },
            { new: true }
          );
        } catch (err) {
          updatedUser = await User.findOneAndUpdate(
            { username: deposit.userId },
            {
              $inc: {
                mainBalance: amountToCredit,
                totalDeposit: amountToCredit,
              },
            },
            { new: true }
          );
        }
      }

      // Automatically push a record into the Transaction ledger model
      const uniqueTxId =
        deposit.transactionId ||
        deposit._id.toString().substring(0, 12).toUpperCase();

      const transactionRecord = await Transaction.create({
        userId: deposit.userId ? deposit.userId.toString() : 'admin_credited',
        uniqueTxId: uniqueTxId,
        amount: amountToCredit,
        amountString: `+${amountToCredit.toFixed(2)} USD`,
        remarkDescription: 'Payment Amount Has Been Approved by Admin',
        type: 'credit',
      });

      // Trigger multi-level referral commission distribution on deposit approval
      if (updatedUser) {
        try {
          await distributeReferralCommissions(updatedUser._id, amountToCredit, `On User Deposit ($${amountToCredit.toFixed(2)})`);
        } catch (refErr) {
          console.warn('[Referral Hook Notice on Deposit Approval]:', refErr.message);
        }
      }

      // Emit real-time events to all clients & target customer
      emitRealtimeEvent('deposit_updated', deposit);
      emitRealtimeEvent('balance_updated', { userId: deposit.userId, balance: updatedUser ? updatedUser.mainBalance : null });
      emitRealtimeEvent('user_updated', { userId: deposit.userId });

      return res.status(200).json({
        success: true,
        message: 'Deposit Approved and balance credited!',
        data: {
          deposit,
          transaction: transactionRecord,
          userBalance: updatedUser ? updatedUser.mainBalance : null,
        },
      });
    } else {
      // In-memory dev state fallback update
      const index = devDepositsState.findIndex((d) => d._id === depositId);
      if (index !== -1) {
        devDepositsState[index].status = 'Approved';
        emitRealtimeEvent('deposit_updated', devDepositsState[index]);
        emitRealtimeEvent('balance_updated', { userId: devDepositsState[index].userId });
        emitRealtimeEvent('user_updated', { userId: devDepositsState[index].userId });
        return res.status(200).json({
          success: true,
          message: 'Deposit Approved and balance credited!',
          data: devDepositsState[index],
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Deposit Approved and balance credited!',
        data: { _id: depositId, status: 'Approved' },
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject deposit request
 * @route   PUT /api/admin/deposits/reject/:id
 * @access  Private (Admin Only)
 */
export const rejectDeposit = async (req, res, next) => {
  try {
    const depositId = req.params.id;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected && mongoose.Types.ObjectId.isValid(depositId)) {
      const deposit = await Deposit.findById(depositId);

      if (!deposit) {
        return res.status(404).json({ error: 'Deposit request record not found.' });
      }

      // Update deposit record status to "Rejected"
      deposit.status = 'Rejected';
      await deposit.save();

      // Record rejection status in transaction logs with actual requested amount without modifying user balance
      const depositAmount = Number(deposit.requestedAmount) || 0;
      const uniqueTxId =
        deposit.transactionId ||
        deposit._id.toString().substring(0, 12).toUpperCase();

      const transactionRecord = await Transaction.create({
        userId: deposit.userId ? deposit.userId.toString() : 'admin_rejected',
        uniqueTxId: uniqueTxId,
        amount: depositAmount,
        amountString: `-$${depositAmount.toFixed(2)} USD`,
        remarkDescription: `Deposit Request of $${depositAmount.toFixed(2)} was Rejected by Admin`,
        type: 'debit',
      });

      // Emit real-time events to all clients & target customer
      emitRealtimeEvent('deposit_updated', deposit);
      emitRealtimeEvent('balance_updated', { userId: deposit.userId });
      emitRealtimeEvent('user_updated', { userId: deposit.userId });

      return res.status(200).json({
        success: true,
        message: 'Deposit Rejected',
        data: {
          deposit,
          transaction: transactionRecord,
        },
      });
    } else {
      // In-memory dev state fallback update
      const index = devDepositsState.findIndex((d) => d._id === depositId);
      if (index !== -1) {
        devDepositsState[index].status = 'Rejected';
        return res.status(200).json({
          success: true,
          message: 'Deposit Rejected',
          data: devDepositsState[index],
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Deposit Rejected',
        data: { _id: depositId, status: 'Rejected' },
      });
    }
  } catch (error) {
    next(error);
  }
};

// Route registrations
router.get('/', adminProtect, getAdminDeposits);
router.put('/approve/:id', adminProtect, approveDeposit);
router.put('/reject/:id', adminProtect, rejectDeposit);

export default router;
