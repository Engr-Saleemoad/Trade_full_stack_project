import express from 'express';
import { submitProof, getMyDepositHistory } from '../controllers/depositController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadProof } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/submit-proof', protect, uploadProof.single('proofImage'), submitProof);
router.get('/my-history', protect, getMyDepositHistory);

export default router;
