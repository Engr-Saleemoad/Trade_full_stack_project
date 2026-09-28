import express from 'express';
import mongoose from 'mongoose';
import Setting from '../models/Setting.js';
import { adminProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Dev state fallback in memory when MongoDB is offline
let devSettingState = {
  key: 'global_settings',
  investmentIntervalMinutes: 1440,
  updatedAt: new Date().toISOString(),
};

/**
 * @desc    Get system global settings for Admin Portal
 * @route   GET /api/admin/settings
 * @access  Private (Admin Only)
 */
export const getAdminSettings = async (req, res, next) => {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      let setting = await Setting.findOne({ key: 'global_settings' });
      if (!setting) {
        setting = await Setting.create({ key: 'global_settings', investmentIntervalMinutes: 1440 });
      }

      return res.status(200).json({
        success: true,
        setting,
        data: setting,
        investmentIntervalMinutes: setting.investmentIntervalMinutes,
      });
    } else {
      return res.status(200).json({
        success: true,
        setting: devSettingState,
        data: devSettingState,
        investmentIntervalMinutes: devSettingState.investmentIntervalMinutes,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update investment claim timer duration setting
 * @route   PUT /api/admin/settings/timer
 * @access  Private (Admin Only)
 */
export const updateTimerSetting = async (req, res, next) => {
  try {
    const { investmentIntervalMinutes, intervalMinutes } = req.body;
    const minutes = Number(investmentIntervalMinutes || intervalMinutes);

    if (isNaN(minutes) || minutes <= 0) {
      return res.status(400).json({ error: 'Please select a valid timer interval duration.' });
    }

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      let setting = await Setting.findOne({ key: 'global_settings' });
      if (!setting) {
        setting = new Setting({ key: 'global_settings', investmentIntervalMinutes: minutes });
      } else {
        setting.investmentIntervalMinutes = minutes;
      }

      await setting.save();

      return res.status(200).json({
        success: true,
        message: `Investment claim timer updated to ${minutes} minute(s)!`,
        setting,
        data: setting,
        investmentIntervalMinutes: minutes,
      });
    } else {
      devSettingState.investmentIntervalMinutes = minutes;
      devSettingState.updatedAt = new Date().toISOString();

      return res.status(200).json({
        success: true,
        message: `Investment claim timer updated to ${minutes} minute(s)!`,
        setting: devSettingState,
        data: devSettingState,
        investmentIntervalMinutes: minutes,
      });
    }
  } catch (error) {
    next(error);
  }
};

// Route registrations
router.get('/', adminProtect, getAdminSettings);
router.put('/', adminProtect, updateTimerSetting);
router.put('/timer', adminProtect, updateTimerSetting);

export default router;
