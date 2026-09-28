import express from 'express';
import { requestPayout, getMyPayoutHistory } from '../controllers/payoutController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/request', protect, requestPayout);
router.get('/my-history', protect, getMyPayoutHistory);

export default router;
