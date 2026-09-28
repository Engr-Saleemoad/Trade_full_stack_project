import express from 'express';
import mongoose from 'mongoose';
import ReferralSetting from '../models/ReferralSetting.js';
import CommissionLog from '../models/CommissionLog.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { adminProtect } from '../middleware/authMiddleware.js';
import { distributeReferralCommissions } from '../utils/referralBonus.js';

const router = express.Router();

// Default seed dev configuration & commission logs if MongoDB is empty or offline
const defaultDevSettings = {
  levels: [
    { levelNumber: 1, percentage: 5.0 },
    { levelNumber: 2, percentage: 2.0 },
    { levelNumber: 3, percentage: 1.0 },
  ],
  triggerType: 'On Plan Purchase',
  isActive: true,
};

const seedDevCommissionLogs = [
  {
    _id: 'log_comm_001',
    referrerUsername: 'john',
    referredUsername: 'lucagracia',
    tierLevel: 1,
    commissionAmount: 2.5,
    sourceTransactionAmount: 50.0,
    triggerEvent: 'Plan Purchase ($50.00)',
    createdAt: new Date('2026-07-19T14:30:00Z').toISOString(),
  },
  {
    _id: 'log_comm_002',
    referrerUsername: 'john',
    referredUsername: 'sarah_c',
    tierLevel: 1,
    commissionAmount: 5.0,
    sourceTransactionAmount: 100.0,
    triggerEvent: 'Deposit Approval ($100.00)',
    createdAt: new Date('2026-07-18T11:20:00Z').toISOString(),
  },
  {
    _id: 'log_comm_003',
    referrerUsername: 'lucagracia',
    referredUsername: 'sarah_c',
    tierLevel: 2,
    commissionAmount: 2.0,
    sourceTransactionAmount: 100.0,
    triggerEvent: 'Deposit Approval ($100.00)',
    createdAt: new Date('2026-07-18T11:20:00Z').toISOString(),
  },
];

// In-memory dev storage state for live updates when MongoDB is offline
let devSettingsState = { _id: 'ref_setting_default_01', ...defaultDevSettings, updatedAt: new Date('2026-07-20T10:00:00Z').toISOString() };
let devLogsState = [...seedDevCommissionLogs];


/**
 * @desc    Get referral commission settings & logs
 * @route   GET /api/admin/referrals
 * @access  Private (Admin Only)
 */
export const getAdminReferrals = async (req, res, next) => {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      let settings = await ReferralSetting.findOne().lean();

      if (!settings) {
        settings = await ReferralSetting.create(defaultDevSettings);
      }

      const logs = await CommissionLog.find().sort({ createdAt: -1 }).lean();

      return res.status(200).json({
        success: true,
        settings,
        logs: logs && logs.length > 0 ? logs : devLogsState,
      });
    } else {
      console.warn('[Admin Referrals] MongoDB offline. Returning dev state configuration and logs.');
      return res.status(200).json({
        success: true,
        settings: devSettingsState,
        logs: devLogsState,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update multi-level referral commission tiers & trigger rules
 * @route   PUT /api/admin/referrals/settings
 * @access  Private (Admin Only)
 */
export const updateAdminReferralSettings = async (req, res, next) => {
  try {
    const { level1, level2, level3, triggerType } = req.body;

    const l1 = Number(level1) >= 0 ? Number(level1) : 5.0;
    const l2 = Number(level2) >= 0 ? Number(level2) : 2.0;
    const l3 = Number(level3) >= 0 ? Number(level3) : 1.0;
    const trigger = triggerType || 'On Plan Purchase';

    const levelsArray = [
      { levelNumber: 1, percentage: l1 },
      { levelNumber: 2, percentage: l2 },
      { levelNumber: 3, percentage: l3 },
    ];

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      let settings = await ReferralSetting.findOne();

      if (!settings) {
        settings = new ReferralSetting({
          levels: levelsArray,
          triggerType: trigger,
          isActive: true,
        });
      } else {
        settings.levels = levelsArray;
        settings.triggerType = trigger;
      }

      await settings.save();

      return res.status(200).json({
        success: true,
        message: 'Commission tiers updated successfully!',
        settings,
      });
    } else {
      devSettingsState = {
        ...devSettingsState,
        levels: levelsArray,
        triggerType: trigger,
        updatedAt: new Date().toISOString(),
      };

      return res.status(200).json({
        success: true,
        message: 'Commission tiers updated successfully!',
        settings: devSettingsState,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Core Referral Commission Automation Distribution Helper
 * @param   {string} referredUserId - ID of user making deposit or purchasing plan
 * @param   {number} amount - Transaction amount in USD
 * @param   {string} triggerEventName - e.g. "Plan Purchase ($50.00)"
 */
export const distributeReferralCommission = async (referredUserId, amount, triggerEventName) => {
  return await distributeReferralCommissions(referredUserId, amount, triggerEventName);
};

// Router Registrations
router.get('/', adminProtect, getAdminReferrals);
router.put('/settings', adminProtect, updateAdminReferralSettings);

export default router;
