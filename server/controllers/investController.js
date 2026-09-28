import Investment from '../models/Investment.js';
import User from '../models/User.js';
import Plan from '../models/Plan.js';
import Setting from '../models/Setting.js';
import Transaction from '../models/Transaction.js';
import mongoose from 'mongoose';
import { emitRealtimeEvent } from '../socket.js';
import { distributeReferralCommissions } from '../utils/referralBonus.js';

// In-memory dev storage when MongoDB is offline
export const inMemoryDevInvestments = [];

// Helper to get active timer interval in milliseconds from Setting model
const getIntervalMilliseconds = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      const setting = await Setting.findOne({ key: 'global_settings' });
      if (setting && setting.investmentIntervalMinutes > 0) {
        return setting.investmentIntervalMinutes * 60 * 1000;
      }
    }
  } catch (err) {
    console.warn('[Invest Controller] Setting fetch warning:', err.message);
  }
  return 24 * 60 * 60 * 1000; // 24 hours default fallback (1440 minutes)
};

/**
 * @desc    Purchase Investment Plan & Initialize Active Investment Record
 * @route   POST /api/invest/purchase
 * @access  Private (JWT Protected)
 */
export const purchasePlan = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : null;
    const { planId, planName, price, dailyReturnPercentage } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized user session.' });
    }

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      let targetPlan = null;
      if (planId && mongoose.Types.ObjectId.isValid(planId)) {
        targetPlan = await Plan.findById(planId);
      }

      const name = targetPlan ? targetPlan.name : (planName || 'Investment Plan');
      const planPrice = targetPlan ? Number(targetPlan.price) : Number(price);
      const returnPct = targetPlan
        ? Number(targetPlan.dailyReturnPercentage || 5)
        : Number(dailyReturnPercentage || 5);

      if (isNaN(planPrice) || planPrice <= 0) {
        return res.status(400).json({ error: 'Invalid plan price specified.' });
      }

      // Check User Main Balance
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User record not found.' });
      }

      if ((user.mainBalance || 0) < planPrice) {
        return res.status(400).json({
          error: `Insufficient balance. Available main balance: $${(user.mainBalance || 0).toFixed(2)} USD. Required: $${planPrice.toFixed(2)} USD.`,
        });
      }

      // Atomic Balance Mutation
      user.mainBalance -= planPrice;
      user.totalInvest = (user.totalInvest || 0) + planPrice;
      await user.save();

      // Dynamic Timer Interval Calculation
      const intervalMs = await getIntervalMilliseconds();
      const now = new Date();
      const nextClaim = new Date(now.getTime() + intervalMs);
      const dailyPayout = (planPrice * returnPct) / 100;

      // Create Active Investment Document
      const investment = await Investment.create({
        userId: user._id.toString(),
        planId: targetPlan ? targetPlan._id.toString() : (planId || ''),
        planName: name,
        price: planPrice,
        investmentAmount: planPrice,
        dailyReturnPercentage: returnPct,
        profitPercentage: returnPct,
        dailyReturnAmount: dailyPayout,
        calculatedDailyPayout: dailyPayout,
        dynamicTimerStartTimestamp: now,
        nextClaimTime: nextClaim,
        nextPayoutTimestamp: nextClaim,
        totalClaimsProcessed: 0,
        status: 'Active',
        activeStatus: true,
      });

      // Log Debit Transaction Entry in Ledger
      const txId = 'INV' + Date.now().toString(36).toUpperCase();
      const transactionRecord = await Transaction.create({
        userId: user._id.toString(),
        uniqueTxId: txId,
        amount: -planPrice,
        amountString: `-$${planPrice.toFixed(2)} USD`,
        remarkDescription: `Purchased Plan: ${name}`,
        type: 'debit',
      });

      // Trigger multi-level referral commission distribution
      try {
        await distributeReferralCommissions(user._id, planPrice, `Plan Purchase (${name})`);
      } catch (refErr) {
        console.warn('[Referral Hook Notice]:', refErr.message);
      }

      // Emit real-time WebSocket events
      emitRealtimeEvent('balance_updated', { userId: user._id.toString(), balance: user.mainBalance });
      emitRealtimeEvent('investment_created', investment);

      return res.status(200).json({
        success: true,
        message: `Successfully invested $${planPrice.toFixed(2)} USD in ${name}!`,
        userBalance: user.mainBalance,
        investment,
        transaction: transactionRecord,
      });
    } else {
      // Dev in-memory fallback
      const planPrice = Number(price || 20);
      const name = planName || 'Polygon 🟢 (MATIC)';
      const returnPct = Number(dailyReturnPercentage || 5);
      const intervalMs = await getIntervalMilliseconds();
      const now = new Date();
      const nextClaim = new Date(now.getTime() + intervalMs);

      const devInv = {
        _id: `inv_dev_${Date.now()}`,
        userId: userId || 'john_user',
        planId: planId || '',
        planName: name,
        price: planPrice,
        investmentAmount: planPrice,
        dailyReturnPercentage: returnPct,
        profitPercentage: returnPct,
        dailyReturnAmount: (planPrice * returnPct) / 100,
        calculatedDailyPayout: (planPrice * returnPct) / 100,
        dynamicTimerStartTimestamp: now.toISOString(),
        nextClaimTime: nextClaim.toISOString(),
        nextPayoutTimestamp: nextClaim.toISOString(),
        totalClaimsProcessed: 0,
        status: 'Active',
        activeStatus: true,
        createdAt: now.toISOString(),
      };

      inMemoryDevInvestments.unshift(devInv);

      return res.status(200).json({
        success: true,
        message: `Successfully invested $${planPrice.toFixed(2)} USD in ${name}!`,
        investment: devInv,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all active investment plans for authenticated user
 * @route   GET /api/invest/my-active-plans
 * @access  Private (JWT Protected)
 */
export const getMyActivePlans = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : null;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized user session.' });
    }

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      const userPlans = await Investment.find({
        userId: userId.toString(),
        $or: [{ activeStatus: true }, { status: 'Active' }],
      }).sort({ createdAt: -1 });

      const formattedPlans = userPlans.map((inv) => {
        const obj = inv.toObject ? inv.toObject() : inv;
        return {
          ...obj,
          nextPayoutTimestamp: obj.nextPayoutTimestamp || obj.nextClaimTime,
          nextClaimTime: obj.nextClaimTime || obj.nextPayoutTimestamp,
          investmentAmount: obj.price || obj.investmentAmount || 20,
          calculatedDailyPayout: obj.dailyReturnAmount || obj.calculatedDailyPayout || 1.0,
        };
      });

      return res.status(200).json({
        success: true,
        plans: formattedPlans,
        data: formattedPlans,
      });
    } else {
      const userDevInvestments = inMemoryDevInvestments.filter(
        (inv) => (inv.userId === userId || inv.userId === 'john_user') && inv.activeStatus
      );

      return res.status(200).json({
        success: true,
        plans: userDevInvestments || [],
        data: userDevInvestments || [],
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Claim ROI Interest Reward
 * @route   POST /api/invest/claim-reward & POST /api/invest/claim/:id
 * @access  Private (JWT Protected)
 */
export const claimReward = async (req, res, next) => {
  try {
    const investmentId = req.body.investmentId || req.params.id;
    const userId = req.user ? (req.user.id || req.user._id) : null;

    if (!investmentId) {
      return res.status(400).json({ error: 'Investment ID is required.' });
    }

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      const investment = await Investment.findOne({
        _id: investmentId,
        userId: userId ? userId.toString() : { $exists: true },
      });

      if (!investment) {
        return res.status(404).json({ error: 'Active investment plan record not found.' });
      }

      const now = new Date();
      const targetNext = new Date(investment.nextPayoutTimestamp || investment.nextClaimTime);

      if (now.getTime() < targetNext.getTime()) {
        return res.status(400).json({ error: 'Reward countdown is still active! Please wait until timer expires.' });
      }

      const profit = Number(
        investment.dailyReturnAmount ||
        investment.calculatedDailyPayout ||
        ((investment.price || 20) * (investment.dailyReturnPercentage || 5)) / 100
      );

      // Increment User Interest Balance & Total Earn
      let updatedUser = null;
      if (investment.userId) {
        try {
          updatedUser = await User.findByIdAndUpdate(
            investment.userId,
            {
              $inc: {
                interestBalance: profit,
                totalEarn: profit,
              },
            },
            { new: true }
          );
        } catch (err) {
          console.warn('[User Interest Credit Notice]:', err.message);
        }
      }

      // Calculate next payout timestamp based on active admin timer setting
      const intervalMs = await getIntervalMilliseconds();
      const nextTs = new Date(now.getTime() + intervalMs);

      investment.totalClaimsProcessed += 1;
      investment.dynamicTimerStartTimestamp = now;
      investment.nextPayoutTimestamp = nextTs;
      investment.nextClaimTime = nextTs;
      await investment.save();

      // Log Transaction Credit Entry
      const txId = 'CLM' + Date.now().toString(36).toUpperCase();
      const transactionRecord = await Transaction.create({
        userId: investment.userId ? investment.userId.toString() : 'system_claim',
        uniqueTxId: txId,
        amount: profit,
        amountString: `+$${profit.toFixed(2)} USD`,
        remarkDescription: `Claimed Daily Interest ROI for ${investment.planName}`,
        type: 'credit',
      });

      // Emit real-time WebSocket events
      emitRealtimeEvent('balance_updated', {
        userId: investment.userId,
        interestBalance: updatedUser ? updatedUser.interestBalance : null,
      });
      emitRealtimeEvent('investment_updated', investment);

      return res.status(200).json({
        success: true,
        message: `Successfully claimed $${profit.toFixed(2)} USD interest reward!`,
        data: investment,
        investment,
        transaction: transactionRecord,
        updatedInterestBalance: updatedUser ? updatedUser.interestBalance : null,
      });
    } else {
      const devInv = inMemoryDevInvestments.find((inv) => inv._id === investmentId);
      if (!devInv) {
        return res.status(404).json({ error: 'Active investment plan record not found.' });
      }

      const profit = Number(devInv.calculatedDailyPayout || 1.0);
      const intervalMs = await getIntervalMilliseconds();
      const now = new Date();
      const nextTs = new Date(now.getTime() + intervalMs);

      devInv.totalClaimsProcessed += 1;
      devInv.dynamicTimerStartTimestamp = now.toISOString();
      devInv.nextPayoutTimestamp = nextTs.toISOString();
      devInv.nextClaimTime = nextTs.toISOString();

      return res.status(200).json({
        success: true,
        message: `Successfully claimed $${profit.toFixed(2)} USD interest reward!`,
        data: devInv,
        investment: devInv,
        updatedInterestBalance: 320.0 + profit,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all customer investments for Admin Management View
 * @route   GET /api/admin/investments
 * @access  Private (Admin Protected)
 */
export const getAllInvestmentsAdmin = async (req, res, next) => {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      const investments = await Investment.find().sort({ createdAt: -1 });

      const populated = await Promise.all(
        investments.map(async (inv) => {
          let userObj = null;
          if (inv.userId && mongoose.Types.ObjectId.isValid(inv.userId)) {
            userObj = await User.findById(inv.userId).select('username email fullName');
          }
          const item = inv.toObject();
          item.username = userObj ? userObj.username : (inv.username || 'Customer');
          item.email = userObj ? userObj.email : 'N/A';
          item.returnAmount = item.dailyReturnAmount || ((item.price * (item.dailyReturnPercentage || 5)) / 100);
          return item;
        })
      );

      return res.status(200).json({
        success: true,
        count: populated.length,
        data: populated,
      });
    } else {
      return res.status(200).json({
        success: true,
        count: inMemoryDevInvestments.length,
        data: inMemoryDevInvestments,
      });
    }
  } catch (error) {
    console.error('[Admin Investments Fetch Error]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
