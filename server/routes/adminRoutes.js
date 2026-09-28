import express from 'express';
import { adminLogin, getAdminDashboardMetrics } from '../controllers/adminController.js';
import { getAllInvestmentsAdmin } from '../controllers/investController.js';
import { getAllLoginLogsAdmin } from '../controllers/userController.js';
import { protectAdmin } from '../middleware/adminAuthMiddleware.js';

const router = express.Router();

router.post('/login', adminLogin);
router.get('/dashboard-metrics', protectAdmin, getAdminDashboardMetrics);
router.get('/investments', protectAdmin, getAllInvestmentsAdmin);
router.get('/login-logs', protectAdmin, getAllLoginLogsAdmin);
router.get('/device-logs', protectAdmin, getAllLoginLogsAdmin);

export default router;
