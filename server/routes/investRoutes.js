import express from 'express';
import { getMyActivePlans, claimReward, purchasePlan } from '../controllers/investController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my-active-plans', protect, getMyActivePlans);
router.post('/purchase', protect, purchasePlan);
router.post('/invest', protect, purchasePlan);
router.post('/claim-reward', protect, claimReward);
router.post('/claim/:id', protect, claimReward);

export default router;
