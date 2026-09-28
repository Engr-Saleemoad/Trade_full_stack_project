import express from 'express';
import { getMyLedger } from '../controllers/transactionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my-ledger', protect, getMyLedger);

export default router;
