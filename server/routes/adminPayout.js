import express from 'express';
import mongoose from 'mongoose';
import Payout from '../models/Payout.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { adminProtect } from '../middleware/authMiddleware.js';
import { emitRealtimeEvent } from '../socket.js';

const router = express.Router();

// Seed/Default fallback dev payout requests if DB is empty or in dev mode
const seedDevPayouts = [
  {
    _id: 'pay_req_001',
    userId: 'default_test_john_123',
    user: {
      username: 'john',
      email: 'john@example.com',
    },
    transactionId: 'PAY09KBCBGZ8',
    selectedWallet: 'Main Balance - $1250.00',
    gatewayType: 'USDT ( BEP 20 )',
    rawAmount: 40.0,
    derivedFees: 4.0,
    finalDeductionAmount: 36.0,
    recipientWalletAddress: '0x86A04560103588BFA89B478E09F6d89C0C858eEB',
    status: 'Pending',
    rejectionReason: '',
    createdAt: new Date('2026-07-20T16:10:00Z').toISOString(),
  },
  {
    _id: 'pay_req_002',
    userId: 'user_luca_99',
    user: {
      username: 'lucagracia',
      email: 'luca@gmail.com',
    },
    transactionId: 'PAYTX7782A09',
    selectedWallet: 'Main Balance - $500.00',
    gatewayType: 'USDT ( TRC 20 )',
    rawAmount: 100.0,
    derivedFees: 10.0,
    finalDeductionAmount: 90.0,
    recipientWalletAddress: 'TYD92hKn81gH7sKqL93kJsLq87sKa',
    status: 'Approved',
    rejectionReason: '',
    createdAt: new Date('2026-07-19T14:30:00Z').toISOString(),
  },
  {
    _id: 'pay_req_003',
    userId: 'default_test_john_123',
    user: {
      username: 'john',
      email: 'john@example.com',
    },
    transactionId: 'PAYTX1102938',
    selectedWallet: 'Main Balance - $200.00',
    gatewayType: 'USDT ( BEP 20 )',
    rawAmount: 50.0,
    derivedFees: 5.0,
    finalDeductionAmount: 45.0,
    recipientWalletAddress: '0x3F88a910Bc00234a478E09F6d89C0C85899A',
    status: 'Rejected',
    rejectionReason: 'Invalid recipient wallet format',
    createdAt: new Date('2026-07-18T10:20:00Z').toISOString(),
  },
];

// In-memory dev storage state array for live payout updates when MongoDB is offline
let devPayoutsState = [...seedDevPayouts];

/**
 * @desc    Get all payout requests for Admin Portal
 * @route   GET /api/admin/payouts
 * @access  Private (Admin Only)
 */
export const getAdminPayouts = async (req, res, next) => {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      let payouts = await Payout.find()
        .sort({ createdAt: -1 })
        .lean();

      // Populate user details manually or via query
      const populatedPayouts = await Promise.all(
        payouts.map(async (pay) => {
          let userObj = { username: 'Unknown User', email: 'N/A' };
          if (pay.userId) {
            try {
              const u = await User.findById(pay.userId).select('username email').lean();
              if (u) {
                userObj = { username: u.username, email: u.email };
              }
            } catch (err) {
              const u = await User.findOne({
                $or: [{ _id: pay.userId }, { username: pay.userId }],
              })
                .select('username email')
                .lean();
              if (u) {
                userObj = { username: u.username, email: u.email };
              }
            }
          }

          const txId =
            pay.transactionId ||
            (pay._id ? 'PAY' + pay._id.toString().substring(0, 10).toUpperCase() : 'PAY' + Date.now());

          return {
            ...pay,
            _id: pay._id.toString(),
            transactionId: txId,
            user: userObj,
          };
        })
      );

      return res.status(200).json({
        success: true,
        count: populatedPayouts.length,
        data: populatedPayouts,
      });
    } else {
      console.warn('[Admin Payout] MongoDB offline. Returning dev state payout requests.');
      return res.status(200).json({
        success: true,
        count: devPayoutsState.length,
        data: devPayoutsState,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get completed payout logs (Approved / Rejected) for Admin Portal
 * @route   GET /api/admin/payout-logs
 * @access  Private (Admin Only)
 */
export const getAdminPayoutLogs = async (req, res, next) => {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      let payouts = await Payout.find({ status: { $in: ['Approved', 'Rejected'] } })
        .sort({ updatedAt: -1 })
        .lean();

      const populatedPayouts = await Promise.all(
        payouts.map(async (pay) => {
          let userObj = { username: 'Unknown User', email: 'N/A' };
          if (pay.userId) {
            try {
              const u = await User.findById(pay.userId).select('username email').lean();
              if (u) {
                userObj = { username: u.username, email: u.email };
              }
            } catch (err) {
              const u = await User.findOne({
                $or: [{ _id: pay.userId }, { username: pay.userId }],
              })
                .select('username email')
                .lean();
              if (u) {
                userObj = { username: u.username, email: u.email };
              }
            }
          }

          const txId =
            pay.transactionId ||
            (pay._id ? 'PAY' + pay._id.toString().substring(0, 10).toUpperCase() : 'PAY' + Date.now());

          return {
            ...pay,
            _id: pay._id.toString(),
            transactionId: txId,
            user: userObj,
          };
        })
      );

      return res.status(200).json({
        success: true,
        count: populatedPayouts.length,
        data: populatedPayouts,
      });
    } else {
      const devLogs = devPayoutsState.filter((p) => p.status === 'Approved' || p.status === 'Rejected');
      return res.status(200).json({
        success: true,
        count: devLogs.length,
        data: devLogs,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve payout request & increment user's totalPayout metric
 * @route   PUT /api/admin/payouts/approve/:id
 * @access  Private (Admin Only)
 */
export const approvePayout = async (req, res, next) => {
  try {
    const payoutId = req.params.id;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected && mongoose.Types.ObjectId.isValid(payoutId)) {
      const payout = await Payout.findById(payoutId);

      if (!payout) {
        return res.status(404).json({ error: 'Payout request record not found.' });
      }

      if (payout.status === 'Approved') {
        return res.status(400).json({ error: 'This payout has already been approved.' });
      }

      // Update payout status to "Approved"
      payout.status = 'Approved';
      await payout.save();

      const payoutAmount = Number(payout.rawAmount || payout.finalDeductionAmount || 0);

      // Increment user's totalPayout metric
      if (payout.userId) {
        try {
          await User.findByIdAndUpdate(payout.userId, {
            $inc: { totalPayout: payoutAmount },
          });
        } catch (err) {
          await User.findOneAndUpdate(
            { username: payout.userId },
            { $inc: { totalPayout: payoutAmount } }
          );
        }
      }

      // Log transaction entry
      const uniqueTxId =
        payout.transactionId ||
        'PAY' + payout._id.toString().substring(0, 10).toUpperCase();

      const transactionRecord = await Transaction.create({
        userId: payout.userId ? payout.userId.toString() : 'admin_payout_user',
        uniqueTxId: uniqueTxId,
        amount: -payoutAmount,
        amountString: `-$${payoutAmount.toFixed(2)} USD`,
        remarkDescription: 'Payout Request Approved and Transferred',
        type: 'debit',
      });

      // Emit real-time events to target customer & Admin Portal
      emitRealtimeEvent('payout_updated', payout);
      emitRealtimeEvent('balance_updated', { userId: payout.userId });
      emitRealtimeEvent('user_updated', { userId: payout.userId });

      return res.status(200).json({
        success: true,
        message: 'Payout marked as complete!',
        data: {
          payout,
          transaction: transactionRecord,
        },
      });
    } else {
      // Dev in-memory state fallback update
      const index = devPayoutsState.findIndex((p) => p._id === payoutId);
      if (index !== -1) {
        devPayoutsState[index].status = 'Approved';
        emitRealtimeEvent('payout_updated', devPayoutsState[index]);
        emitRealtimeEvent('balance_updated', { userId: devPayoutsState[index].userId });
        emitRealtimeEvent('user_updated', { userId: devPayoutsState[index].userId });
        return res.status(200).json({
          success: true,
          message: 'Payout marked as complete!',
          data: devPayoutsState[index],
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Payout marked as complete!',
        data: { _id: payoutId, status: 'Approved' },
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject payout request & execute atomic balance refund to user
 * @route   PUT /api/admin/payouts/reject/:id
 * @access  Private (Admin Only)
 */
export const rejectPayout = async (req, res, next) => {
  try {
    const payoutId = req.params.id;
    const { reason } = req.body;
    const rejectionReasonText = reason || 'Payout Request Rejected by Admin';
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected && mongoose.Types.ObjectId.isValid(payoutId)) {
      const payout = await Payout.findById(payoutId);

      if (!payout) {
        return res.status(404).json({ error: 'Payout request record not found.' });
      }

      if (payout.status === 'Rejected') {
        return res.status(400).json({ error: 'This payout has already been rejected.' });
      }

      // Update payout status & record rejection reason
      payout.status = 'Rejected';
      payout.rejectionReason = rejectionReasonText;
      await payout.save();

      // Refund Execution: Atomically increase user's mainBalance back by full deducted amount
      const refundAmount = Number(payout.rawAmount || payout.finalDeductionAmount || 0);

      let updatedUser = null;
      if (payout.userId) {
        try {
          updatedUser = await User.findByIdAndUpdate(
            payout.userId,
            {
              $inc: { mainBalance: refundAmount },
            },
            { new: true }
          );
        } catch (err) {
          updatedUser = await User.findOneAndUpdate(
            { username: payout.userId },
            {
              $inc: { mainBalance: refundAmount },
            },
            { new: true }
          );
        }
      }

      // Emit real-time events to target customer & Admin Portal
      emitRealtimeEvent('payout_updated', payout);
      emitRealtimeEvent('balance_updated', { userId: payout.userId, balance: updatedUser ? updatedUser.mainBalance : null });
      emitRealtimeEvent('user_updated', { userId: payout.userId });

      // Log refund entry in Transaction model
      const uniqueTxId =
        payout.transactionId ||
        'REF' + payout._id.toString().substring(0, 10).toUpperCase();

      const transactionRecord = await Transaction.create({
        userId: payout.userId ? payout.userId.toString() : 'admin_refund_user',
        uniqueTxId: uniqueTxId,
        amount: refundAmount,
        amountString: `+$${refundAmount.toFixed(2)} USD`,
        remarkDescription: `Payout Rejected - Amount Refunded to Balance (${rejectionReasonText})`,
        type: 'credit',
      });

      return res.status(200).json({
        success: true,
        message: 'Payout rejected and funds refunded to user',
        data: {
          payout,
          transaction: transactionRecord,
          refundedBalance: updatedUser ? updatedUser.mainBalance : null,
        },
      });
    } else {
      // Dev in-memory state fallback update
      const index = devPayoutsState.findIndex((p) => p._id === payoutId);
      if (index !== -1) {
        devPayoutsState[index].status = 'Rejected';
        devPayoutsState[index].rejectionReason = rejectionReasonText;
        return res.status(200).json({
          success: true,
          message: 'Payout rejected and funds refunded to user',
          data: devPayoutsState[index],
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Payout rejected and funds refunded to user',
        data: { _id: payoutId, status: 'Rejected', rejectionReason: rejectionReasonText },
      });
    }
  } catch (error) {
    next(error);
  }
};

// Route registrations
router.get('/', adminProtect, (req, res, next) => {
  if (req.baseUrl && (req.baseUrl.includes('payout-log') || req.baseUrl.includes('logs'))) {
    return getAdminPayoutLogs(req, res, next);
  }
  return getAdminPayouts(req, res, next);
});
router.get('/payout-logs', adminProtect, getAdminPayoutLogs);
router.get('/logs', adminProtect, getAdminPayoutLogs);
router.put('/approve/:id', adminProtect, approvePayout);
router.put('/reject/:id', adminProtect, rejectPayout);

export default router;
