import express from 'express';
import {
  createSubAdmin,
  getSubAdmins,
  updateSubAdminPermissions,
  deleteSubAdmin,
} from '../controllers/subAdminController.js';
import { protectAdmin } from '../middleware/adminAuthMiddleware.js';

const router = express.Router();

router.use(protectAdmin);

router.post('/', createSubAdmin);
router.get('/', getSubAdmins);
router.put('/:id/permissions', updateSubAdminPermissions);
router.delete('/:id', deleteSubAdmin);

export default router;
