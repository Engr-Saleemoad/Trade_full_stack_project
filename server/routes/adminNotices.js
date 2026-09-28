import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Notice from '../models/Notice.js';
import { adminProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Ensure uploads/notices directory exists
const uploadDir = path.join(process.cwd(), 'uploads', 'notices');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, 'notice-' + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 }, // 1MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// Seed / Dev In-Memory Storage Fallback
const seedDevNotices = [
  {
    _id: 'notice_default_001',
    title: '🚀 System Upgrade & Maintenance Notice',
    description: 'We are deploying high-frequency trading server optimization. All withdrawal processing and ROI distributions remain active 24/7 without interruption.',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60',
    isActive: true,
    priority: 'Urgent',
    createdAt: new Date('2026-07-20T10:00:00Z').toISOString(),
  },
  {
    _id: 'notice_default_002',
    title: '🎁 5% Deposit Bonus Event Active',
    description: 'Enjoy a 5% instant bonus credited directly to your Main Balance on all USDT (BEP20 & TRC20) deposits executed this week.',
    imageUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&auto=format&fit=crop&q=60',
    isActive: true,
    priority: 'Important',
    createdAt: new Date('2026-07-18T14:30:00Z').toISOString(),
  },
];

let devNoticesState = [...seedDevNotices];

/**
 * @desc    Get all notices for admin table
 * @route   GET /api/admin/notices
 * @access  Private (Admin)
 */
export const getAdminNotices = async (req, res, next) => {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      const notices = await Notice.find({}).sort({ createdAt: -1 }).lean();
      if (!notices || notices.length === 0) {
        return res.status(200).json({ success: true, data: devNoticesState });
      }
      return res.status(200).json({ success: true, data: notices });
    } else {
      return res.status(200).json({ success: true, data: devNoticesState });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new announcement notice
 * @route   POST /api/admin/notices
 * @access  Private (Admin)
 */
export const createNotice = async (req, res, next) => {
  try {
    const { title, description, priority, isActive, imageUrl: inputUrl } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Notice title is required.' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Notice description is required.' });
    }

    let finalImageUrl = inputUrl || '';
    if (req.file) {
      const protocol = req.protocol || 'http';
      const host = req.get('host') || 'localhost:5000';
      finalImageUrl = `${protocol}://${host}/uploads/notices/${req.file.filename}`;
    }

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      const newNotice = await Notice.create({
        title: title.trim(),
        description: description.trim(),
        imageUrl: finalImageUrl,
        priority: priority || 'Normal',
        isActive: isActive === 'true' || isActive === true,
      });

      return res.status(201).json({
        success: true,
        message: 'Notice announcement published successfully!',
        data: newNotice,
      });
    } else {
      const devNotice = {
        _id: 'notice_' + Date.now(),
        title: title.trim(),
        description: description.trim(),
        imageUrl: finalImageUrl || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60',
        priority: priority || 'Normal',
        isActive: isActive === 'true' || isActive === true,
        createdAt: new Date().toISOString(),
      };
      devNoticesState.unshift(devNotice);

      return res.status(201).json({
        success: true,
        message: 'Notice announcement published successfully!',
        data: devNotice,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update notice announcement
 * @route   PUT /api/admin/notices/:id
 * @access  Private (Admin)
 */
export const updateNotice = async (req, res, next) => {
  try {
    const noticeId = req.params.id;
    const { title, description, priority, isActive, imageUrl: inputUrl } = req.body;

    const isMongoConnected = mongoose.connection.readyState === 1;

    let updateFields = {};
    if (title !== undefined) updateFields.title = title.trim();
    if (description !== undefined) updateFields.description = description.trim();
    if (priority !== undefined) updateFields.priority = priority;
    if (isActive !== undefined) updateFields.isActive = isActive === 'true' || isActive === true;

    if (req.file) {
      updateFields.imageUrl = `/uploads/notices/${req.file.filename}`;
    } else if (inputUrl !== undefined) {
      updateFields.imageUrl = inputUrl;
    }

    if (isMongoConnected && mongoose.Types.ObjectId.isValid(noticeId)) {
      const updated = await Notice.findByIdAndUpdate(noticeId, updateFields, {
        new: true,
        runValidators: true,
      });

      if (!updated) {
        return res.status(404).json({ error: 'Notice record not found.' });
      }

      return res.status(200).json({
        success: true,
        message: 'Notice updated successfully!',
        data: updated,
      });
    } else {
      const idx = devNoticesState.findIndex((n) => n._id === noticeId);
      if (idx !== -1) {
        devNoticesState[idx] = { ...devNoticesState[idx], ...updateFields };
        return res.status(200).json({
          success: true,
          message: 'Notice updated successfully!',
          data: devNoticesState[idx],
        });
      }
      return res.status(404).json({ error: 'Notice record not found.' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle notice active status (show/hide)
 * @route   PATCH /api/admin/notices/:id/toggle
 * @access  Private (Admin)
 */
export const toggleNoticeStatus = async (req, res, next) => {
  try {
    const noticeId = req.params.id;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected && mongoose.Types.ObjectId.isValid(noticeId)) {
      const notice = await Notice.findById(noticeId);
      if (!notice) {
        return res.status(404).json({ error: 'Notice record not found.' });
      }
      notice.isActive = !notice.isActive;
      await notice.save();

      return res.status(200).json({
        success: true,
        message: `Notice status updated to ${notice.isActive ? 'Active' : 'Inactive'}`,
        data: notice,
      });
    } else {
      const idx = devNoticesState.findIndex((n) => n._id === noticeId);
      if (idx !== -1) {
        devNoticesState[idx].isActive = !devNoticesState[idx].isActive;
        return res.status(200).json({
          success: true,
          message: `Notice status updated to ${devNoticesState[idx].isActive ? 'Active' : 'Inactive'}`,
          data: devNoticesState[idx],
        });
      }
      return res.status(404).json({ error: 'Notice record not found.' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete notice permanently
 * @route   DELETE /api/admin/notices/:id
 * @access  Private (Admin)
 */
export const deleteNotice = async (req, res, next) => {
  try {
    const noticeId = req.params.id;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected && mongoose.Types.ObjectId.isValid(noticeId)) {
      const deleted = await Notice.findByIdAndDelete(noticeId);
      if (!deleted) {
        return res.status(404).json({ error: 'Notice record not found.' });
      }
      return res.status(200).json({ success: true, message: 'Notice deleted successfully!' });
    } else {
      devNoticesState = devNoticesState.filter((n) => n._id !== noticeId);
      return res.status(200).json({ success: true, message: 'Notice deleted successfully!' });
    }
  } catch (error) {
    next(error);
  }
};

// Route Registrations
router.get('/', adminProtect, getAdminNotices);
router.post('/', adminProtect, upload.single('image'), createNotice);
router.put('/:id', adminProtect, upload.single('image'), updateNotice);
router.patch('/:id/toggle', adminProtect, toggleNoticeStatus);
router.delete('/:id', adminProtect, deleteNotice);

export default router;
export { devNoticesState };
