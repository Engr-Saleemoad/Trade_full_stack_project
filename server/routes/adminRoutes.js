import express from 'express';
import { adminLogin, getAdminDashboardMetrics } from '../controllers/adminController.js';
import { protectAdmin } from '../middleware/adminAuthMiddleware.js';

const router = express.Router();

router.post('/login', adminLogin);
router.get('/dashboard-metrics', protectAdmin, getAdminDashboardMetrics);

export default router;
