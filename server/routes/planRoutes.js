import express from 'express';
import mongoose from 'mongoose';
import Plan from '../models/Plan.js';

const router = express.Router();

// Fallback seed plans if database collection is empty
const defaultSeedPlans = [
  {
    _id: 'plan_shib_01',
    name: 'Shiba Inu (SHIB)',
    tokenSymbol: 'SHIB',
    price: 20.0,
    dailyReturnPercentage: 4.5,
    frequency: 'Every 24 Hours',
    capitalBack: true,
    badgeTag: 'HOT',
    isActive: true,
  },
  {
    _id: 'plan_matic_02',
    name: 'Polygon (MATIC)',
    tokenSymbol: 'MATIC',
    price: 50.0,
    dailyReturnPercentage: 5.0,
    frequency: 'Every 24 Hours',
    capitalBack: true,
    badgeTag: 'Featured',
    isActive: true,
  },
  {
    _id: 'plan_ada_03',
    name: 'Cardano (ADA)',
    tokenSymbol: 'ADA',
    price: 100.0,
    dailyReturnPercentage: 6.2,
    frequency: 'Every 24 Hours',
    capitalBack: true,
    badgeTag: 'Daily 6%',
    isActive: true,
  },
  {
    _id: 'plan_avax_04',
    name: 'Avalanche (AVAX)',
    tokenSymbol: 'AVAX',
    price: 250.0,
    dailyReturnPercentage: 7.5,
    frequency: 'Every 24 Hours',
    capitalBack: true,
    badgeTag: 'High Yield',
    isActive: true,
  },
  {
    _id: 'plan_sol_05',
    name: 'Solana (SOL)',
    tokenSymbol: 'SOL',
    price: 500.0,
    dailyReturnPercentage: 9.0,
    frequency: 'Every 24 Hours',
    capitalBack: true,
    badgeTag: 'VIP Tier',
    isActive: true,
  },
];

/**
 * @desc    Get active investment plans for public & customer portals
 * @route   GET /api/plans
 * @access  Public / Authenticated
 */
export const getActivePlans = async (req, res, next) => {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;

    let activePlans = [];

    if (isMongoConnected) {
      activePlans = await Plan.find({ isActive: true }).sort({ price: 1 }).lean();

      if (!activePlans || activePlans.length === 0) {
        const seedPlans = [
          { name: 'Polygon (MATIC)', tokenSymbol: 'MATIC', price: 20, dailyReturnPercentage: 3, frequency: '24 Hours', isActive: true, badgeTag: 'HOT' },
          { name: 'Cardano (ADA)', tokenSymbol: 'ADA', price: 50, dailyReturnPercentage: 3.5, frequency: '24 Hours', isActive: true, badgeTag: 'POPULAR' },
          { name: 'Binance Coin', tokenSymbol: 'BNB', price: 100, dailyReturnPercentage: 4, frequency: '24 Hours', isActive: true, badgeTag: 'BEST VALUE' },
        ];
        await Plan.insertMany(seedPlans);
        activePlans = await Plan.find({ isActive: true }).sort({ price: 1 }).lean();
      }
    } else {
      activePlans = defaultSeedPlans;
    }

    return res.status(200).json({
      success: true,
      plans: activePlans,
      data: activePlans,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch investment packages' });
  }
};

router.get('/', getActivePlans);

export default router;
