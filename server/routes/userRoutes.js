import express from 'express';
import {
  getDashboardStats,
  getUserProfile,
  changePassword,
  transferBalance,
  lookupUser,
  requestMoneyTransfer,
  getLoginLogs,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard-stats', protect, getDashboardStats);
router.get('/profile', protect, getUserProfile);
router.get('/lookup', protect, lookupUser);
router.get('/login-logs', protect, getLoginLogs);
router.post('/change-password', protect, changePassword);
router.post('/transfer', protect, transferBalance);
router.post('/transfer-request', protect, requestMoneyTransfer);

export default router;
