import Payout from '../models/Payout.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { emitRealtimeEvent } from '../socket.js';

// In-memory dev storage when MongoDB is offline
export const inMemoryDevPayouts = [
  {
    _id: 'payout_dev_1',
    userId: 'john_user',
    transactionId: 'PW9823471029',
    selectedWallet: 'Deposit Balance - $45',
    gatewayType: 'USDT BEP20',
    rawAmount: 40,
    derivedFees: 4,
    finalDeductionAmount: 44,
    recipientWalletAddress: '0x86A04560103588BFA89B478E09F6d89C0C858eEB',
    status: 'Pending',
    createdAt: new Date('2026-07-20T16:00:00Z').toISOString(),
  },
];

/**
 * @desc    Submit new withdrawal payout request
 * @route   POST /api/payout/request
 * @access  Private (JWT Protected)
 */
export const requestPayout = async (req, res, next) => {
  try {
    const { selectedWallet, gatewayType, rawAmount, recipientWalletAddress } = req.body;
    const userId = req.user ? req.user.id : 'john_user';

    const amountNum = Number(rawAmount);
    if (!amountNum || isNaN(amountNum) || amountNum < 10 || amountNum > 500) {
      res.status(400);
      throw new Error('Payout request amount must be strictly between 10 and 500 USD.');
    }

    if (!recipientWalletAddress || !recipientWalletAddress.trim()) {
      res.status(400);
      throw new Error('Recipient Wallet Address is mandatory.');
    }

    const fees = Number((amountNum * 0.1).toFixed(2)); // 10% fee
    const finalDeduction = amountNum + fees;
    const txId = 'PW' + Date.now().toString().slice(-10);

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      const user = await User.findById(userId);
      if (user) {
        const currentBal = user.mainBalance || 0;
        if (currentBal < finalDeduction) {
          res.status(400);
          throw new Error(
            `Insufficient funds! Available balance is $${currentBal.toFixed(
              2
            )}, but total required deduction is $${finalDeduction.toFixed(2)}.`
          );
        }

        user.mainBalance -= finalDeduction;
        user.totalPayout = (user.totalPayout || 0) + amountNum;
        await user.save();
      }

      const payout = await Payout.create({
        userId,
        transactionId: txId,
        selectedWallet: selectedWallet || 'Deposit Balance - $45',
        gatewayType: gatewayType || 'USDT BEP20',
        rawAmount: amountNum,
        derivedFees: fees,
        finalDeductionAmount: finalDeduction,
        recipientWalletAddress,
        status: 'Pending',
      });

      // Emit real-time event to Admin Portal
      emitRealtimeEvent('payout_created', payout);

      return res.status(201).json({
        success: true,
        message: 'Your request has been successfully submitted! Admin will review it shortly.',
        data: payout,
      });
    } else {
      console.warn('[Database Notice] MongoDB is offline. Processing payout request in dev fallback mode.');

      const devPayout = {
        _id: 'dev_payout_' + Date.now(),
        userId,
        transactionId: txId,
        selectedWallet: selectedWallet || 'Deposit Balance - $45',
        gatewayType: gatewayType || 'USDT BEP20',
        rawAmount: amountNum,
        derivedFees: fees,
        finalDeductionAmount: finalDeduction,
        recipientWalletAddress,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };

      inMemoryDevPayouts.unshift(devPayout);

      // Emit real-time event to Admin Portal
      emitRealtimeEvent('payout_created', devPayout);

      return res.status(201).json({
        success: true,
        message: 'Your request has been successfully submitted! Admin will review it shortly.',
        data: devPayout,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user payout withdrawal history
 * @route   GET /api/payout/my-history
 * @access  Private (JWT Protected)
 */
export const getMyPayoutHistory = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : null;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized user session.' });
    }

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      const payouts = await Payout.find({ userId }).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        payouts,
        data: payouts,
      });
    } else {
      const userDevPayouts = inMemoryDevPayouts.filter((p) => p.userId === userId);

      return res.status(200).json({
        success: true,
        payouts: userDevPayouts,
        data: userDevPayouts,
      });
    }
  } catch (error) {
    next(error);
  }
};
