import express from 'express';
import mongoose from 'mongoose';
import Notice from '../models/Notice.js';
import { devNoticesState } from './adminNotices.js';

const router = express.Router();

/**
 * @desc    Get the single latest active notice announcement for customer login popup
 * @route   GET /api/notices/active
 * @access  Public / Authenticated Customer
 */
export const getActiveNotice = async (req, res, next) => {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;

    let activeNotice = null;

    if (isMongoConnected) {
      activeNotice = await Notice.findOne({ isActive: true })
        .sort({ createdAt: -1 })
        .lean();
    }

    if (!activeNotice) {
      activeNotice = devNoticesState.find((n) => n.isActive) || null;
    }

    return res.status(200).json({
      success: true,
      notice: activeNotice,
      data: activeNotice,
    });
  } catch (error) {
    next(error);
  }
};

router.get('/active', getActiveNotice);

export default router;
