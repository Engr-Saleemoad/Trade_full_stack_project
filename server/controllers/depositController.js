import Deposit from '../models/Deposit.js';
import mongoose from 'mongoose';
import { emitRealtimeEvent } from '../socket.js';

// In-memory dev storage when MongoDB is offline
export const inMemoryDevDeposits = [];

/**
 * @desc    Submit payment proof screenshot for deposit verification
 * @route   POST /api/deposit/submit-proof
 * @access  Private (JWT Protected)
 */
export const submitProof = async (req, res, next) => {
  try {
    const { requestedAmount, gatewayType, walletAddress } = req.body;
    const userId = req.user ? req.user.id : 'john_user';

    if (!req.file) {
      res.status(400);
      throw new Error('Please upload a payment proof image screenshot.');
    }

    const proofImagePath = `/uploads/${req.file.filename}`;
    const amountNum = Number(requestedAmount) || 100;
    const gateway = gatewayType || 'USDT BEP20';
    const address = walletAddress || '0x86A04560103588BFA89B478E09F6d89C0C858eEB';

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      const deposit = await Deposit.create({
        userId,
        requestedAmount: amountNum,
        gatewayType: gateway,
        walletAddress: address,
        status: 'Pending',
        proofImage: proofImagePath,
      });

      // Emit real-time socket notification to Admin Portal
      emitRealtimeEvent('deposit_created', deposit);

      return res.status(201).json({
        success: true,
        message: 'Payment proof submitted successfully! Verification pending.',
        data: deposit,
      });
    } else {
      console.warn('[Database Notice] MongoDB is offline. Saving deposit proof in dev fallback mode.');

      const devDeposit = {
        _id: 'dev_dep_' + Date.now(),
        userId,
        transactionId: '09KBCBGZ8FU4',
        requestedAmount: amountNum,
        gatewayType: gateway,
        walletAddress: address,
        status: 'Pending',
        proofImage: proofImagePath,
        createdAt: new Date().toISOString(),
      };

      inMemoryDevDeposits.push(devDeposit);

      // Emit real-time socket notification to Admin Portal
      emitRealtimeEvent('deposit_created', devDeposit);

      return res.status(201).json({
        success: true,
        message: 'Payment proof submitted successfully! Verification pending.',
        data: devDeposit,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get deposit history for authenticated user
 * @route   GET /api/deposit/my-history
 * @access  Private (JWT Protected)
 */
export const getMyDepositHistory = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : null;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized user session.' });
    }

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      const deposits = await Deposit.find({ userId }).sort({ createdAt: -1 });

      const formatted = deposits.map((d) => ({
        _id: d._id,
        transactionId: d._id.toString().substring(0, 12).toUpperCase(),
        gatewayType: d.gatewayType || 'USDT ( BEP 20 )',
        requestedAmount: d.requestedAmount || 100,
        charge: 0,
        status: d.status || 'Pending',
        createdAt: d.createdAt,
      }));

      return res.status(200).json({
        success: true,
        history: deposits,
        data: formatted,
      });
    } else {
      const userDevDeposits = inMemoryDevDeposits.filter((d) => d.userId === userId);

      const formatted = userDevDeposits.map((d) => ({
        _id: d._id,
        transactionId: d.transactionId || '09KBCBGZ8FU4',
        gatewayType: d.gatewayType || 'USDT ( BEP 20 )',
        requestedAmount: d.requestedAmount || 100,
        charge: 0,
        status: d.status || 'Pending',
        createdAt: d.createdAt,
      }));

      return res.status(200).json({
        success: true,
        history: userDevDeposits,
        data: formatted,
      });
    }
  } catch (error) {
    next(error);
  }
};
