import SubAdmin from '../models/SubAdmin.js';
import mongoose from 'mongoose';

// In-memory dev storage fallback if Mongo is offline
export const inMemoryDevSubAdmins = [];

/**
 * @desc    Create a new Sub-Admin (Master Admin action)
 * @route   POST /api/admin/sub-admins
 * @access  Private (Master Admin only)
 */
export const createSubAdmin = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required.' });
    }

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      const existingUser = await SubAdmin.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
        return res.status(400).json({ error: 'Sub-Admin with this username or email already exists.' });
      }

      const defaultPermissions = {
        users: { read: false, update: false, delete: false },
        deposits: { read: false, update: false, delete: false },
        payouts: { read: false, update: false, delete: false },
        investments: { read: false, update: false, delete: false },
        notices: { read: false, update: false, delete: false },
        settings: { read: false, update: false, delete: false },
      };

      const subAdmin = await SubAdmin.create({
        username,
        email,
        password,
        role: 'sub-admin',
        permissions: defaultPermissions,
      });

      return res.status(201).json({
        success: true,
        message: 'Sub-Admin created successfully! Permissions set to 0 by default.',
        data: {
          _id: subAdmin._id,
          username: subAdmin.username,
          email: subAdmin.email,
          role: subAdmin.role,
          permissions: subAdmin.permissions,
        },
      });
    } else {
      const devSub = {
        _id: 'sub_' + Date.now(),
        username,
        email,
        role: 'sub-admin',
        permissions: {
          users: { read: false, update: false, delete: false },
          deposits: { read: false, update: false, delete: false },
          payouts: { read: false, update: false, delete: false },
          investments: { read: false, update: false, delete: false },
          notices: { read: false, update: false, delete: false },
          settings: { read: false, update: false, delete: false },
        },
        createdAt: new Date().toISOString(),
      };
      inMemoryDevSubAdmins.push(devSub);

      return res.status(201).json({
        success: true,
        message: 'Sub-Admin created in dev mode!',
        data: devSub,
      });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all Sub-Admins
 * @route   GET /api/admin/sub-admins
 * @access  Private (Master Admin only)
 */
export const getSubAdmins = async (req, res, next) => {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      const subAdmins = await SubAdmin.find().select('-password').sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: subAdmins.length,
        data: subAdmins,
      });
    } else {
      return res.status(200).json({
        success: true,
        count: inMemoryDevSubAdmins.length,
        data: inMemoryDevSubAdmins,
      });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update Sub-Admin Permissions Matrix
 * @route   PUT /api/admin/sub-admins/:id/permissions
 * @access  Private (Master Admin only)
 */
export const updateSubAdminPermissions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;

    if (!permissions) {
      return res.status(400).json({ error: 'Permissions payload is required.' });
    }

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      const subAdmin = await SubAdmin.findById(id);
      if (!subAdmin) {
        return res.status(404).json({ error: 'Sub-Admin record not found.' });
      }

      subAdmin.permissions = permissions;
      await subAdmin.save();

      return res.status(200).json({
        success: true,
        message: 'Sub-Admin permissions updated successfully!',
        data: {
          _id: subAdmin._id,
          username: subAdmin.username,
          email: subAdmin.email,
          permissions: subAdmin.permissions,
        },
      });
    } else {
      const target = inMemoryDevSubAdmins.find((s) => s._id === id);
      if (target) {
        target.permissions = permissions;
      }
      return res.status(200).json({
        success: true,
        message: 'Sub-Admin permissions updated in dev mode!',
        data: target || { permissions },
      });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete a Sub-Admin
 * @route   DELETE /api/admin/sub-admins/:id
 * @access  Private (Master Admin only)
 */
export const deleteSubAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      await SubAdmin.findByIdAndDelete(id);
      return res.status(200).json({
        success: true,
        message: 'Sub-Admin account removed permanently.',
      });
    } else {
      const idx = inMemoryDevSubAdmins.findIndex((s) => s._id === id);
      if (idx !== -1) inMemoryDevSubAdmins.splice(idx, 1);
      return res.status(200).json({
        success: true,
        message: 'Sub-Admin removed in dev mode.',
      });
    }
  } catch (err) {
    next(err);
  }
};
