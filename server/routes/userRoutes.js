import express from 'express';
import { getDashboardStats, getUserProfile, changePassword, transferBalance } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard-stats', protect, getDashboardStats);
router.get('/profile', protect, getUserProfile);
router.post('/change-password', protect, changePassword);
router.post('/transfer', protect, transferBalance);

export default router;
