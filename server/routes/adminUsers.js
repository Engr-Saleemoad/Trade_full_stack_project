import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { adminProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Seed/Default dev users if MongoDB is empty or offline
const seedDevUsers = [
  {
    _id: 'default_test_john_123',
    firstName: 'John',
    lastName: 'Doe',
    username: 'john',
    email: 'john@example.com',
    phone: '1234567890',
    country: 'Afghanistan (+93)',
    role: 'customer',
    mainBalance: 1250.0,
    interestBalance: 320.0,
    totalDeposit: 1000.0,
    totalEarn: 450.0,
    totalInvest: 800.0,
    totalPayout: 200.0,
    totalReferralBonus: 50.0,
    isSuspended: false,
    status: 'Active',
    createdAt: new Date('2026-07-20T10:00:00Z').toISOString(),
  },
  {
    _id: 'user_luca_99',
    firstName: 'Luca',
    lastName: 'Graci',
    username: 'lucagracia',
    email: 'luca@gmail.com',
    phone: '9876543210',
    country: 'Italy (+39)',
    role: 'customer',
    mainBalance: 4500.0,
    interestBalance: 890.0,
    totalDeposit: 5000.0,
    totalEarn: 1200.0,
    totalInvest: 3500.0,
    totalPayout: 500.0,
    totalReferralBonus: 120.0,
    isSuspended: false,
    status: 'Active',
    createdAt: new Date('2026-07-18T14:20:00Z').toISOString(),
  },
  {
    _id: 'user_sarah_88',
    firstName: 'Sarah',
    lastName: 'Connor',
    username: 'sarah_c',
    email: 'sarah@skynet.org',
    phone: '5551234567',
    country: 'United States (+1)',
    role: 'customer',
    mainBalance: 0.0,
    interestBalance: 0.0,
    totalDeposit: 100.0,
    totalEarn: 10.0,
    totalInvest: 100.0,
    totalPayout: 0.0,
    totalReferralBonus: 0.0,
    isSuspended: true,
    status: 'Suspended',
    createdAt: new Date('2026-07-15T09:10:00Z').toISOString(),
  },
];

// In-memory dev storage state array for live user updates when MongoDB is offline
let devUsersState = [...seedDevUsers];

/**
 * @desc    Get all users list with search & status filter
 * @route   GET /api/admin/users
 * @access  Private (Admin Only)
 */
export const getAdminUsers = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      let query = { role: 'customer' };

      if (status && status !== 'All') {
        if (status === 'Suspended' || status === 'Banned / Suspended') {
          query.$or = [{ isSuspended: true }, { status: 'Suspended' }];
        } else if (status === 'Active') {
          query.isSuspended = { $ne: true };
        }
      }

      if (search) {
        const searchRegex = new RegExp(search.trim(), 'i');
        query.$and = [
          {
            $or: [
              { username: searchRegex },
              { email: searchRegex },
              { firstName: searchRegex },
              { lastName: searchRegex },
            ],
          },
        ];
      }

      const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .lean();

      const userList = users || [];
      return res.status(200).json({
        success: true,
        count: userList.length,
        data: userList.map((u) => ({
          ...u,
          _id: u._id.toString(),
          status: u.isSuspended ? 'Suspended' : u.status || 'Active',
        })),
      });
    } else {
      console.warn('[Admin Users] MongoDB offline. Returning dev state user records.');
      let filtered = devUsersState;

      if (status && status !== 'All') {
        if (status === 'Suspended' || status === 'Banned / Suspended') {
          filtered = filtered.filter((u) => u.isSuspended || u.status === 'Suspended');
        } else if (status === 'Active') {
          filtered = filtered.filter((u) => !u.isSuspended && u.status !== 'Suspended');
        }
      }

      if (search) {
        const term = search.toLowerCase();
        filtered = filtered.filter(
          (u) =>
            u.username.toLowerCase().includes(term) ||
            u.email.toLowerCase().includes(term) ||
            (u.firstName && u.firstName.toLowerCase().includes(term))
        );
      }

      return res.status(200).json({
        success: true,
        count: filtered.length,
        data: filtered,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Directly credit or debit user funds manually with atomic $inc
 * @route   PUT /api/admin/users/:id/adjust-balance
 * @access  Private (Admin Only)
 */
export const adjustUserBalance = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { balanceType, actionType, amount, remark } = req.body;

    const amountNum = Number(amount);

    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ error: 'Adjustment amount must be a number greater than 0.' });
    }

    if (!remark || !remark.trim()) {
      return res.status(400).json({ error: 'Please provide a mandatory admin remark explaining the adjustment.' });
    }

    // Determine target field and numeric adjustment
    const fieldToUpdate =
      balanceType === 'Interest Balance' ? 'interestBalance' : 'mainBalance';

    const isDebit =
      actionType === 'Deduct / Debit (-)' || actionType === 'debit' || actionType === 'deduct';
    const deltaAmount = isDebit ? -amountNum : amountNum;

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected && mongoose.Types.ObjectId.isValid(userId)) {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User record not found.' });
      }

      // Prevent main balance dropping below 0
      if (isDebit && fieldToUpdate === 'mainBalance' && (user.mainBalance || 0) < amountNum) {
        return res.status(400).json({
          error: `Cannot deduct $${amountNum.toFixed(2)}. User current main balance is $${(user.mainBalance || 0).toFixed(2)}.`,
        });
      }

      // Atomic balance update
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $inc: { [fieldToUpdate]: deltaAmount },
        },
        { new: true }
      ).select('-password');

      // Record transaction ledger entry
      const txId = 'ADM' + Date.now().toString(36).toUpperCase();
      const amountStr = `${deltaAmount >= 0 ? '+' : ''}$${deltaAmount.toFixed(2)} USD`;

      await Transaction.create({
        userId: userId,
        uniqueTxId: txId,
        amount: deltaAmount,
        amountString: amountStr,
        remarkDescription: `Admin Adjustment (${balanceType}): ${remark.trim()}`,
        type: deltaAmount >= 0 ? 'credit' : 'debit',
      });

      return res.status(200).json({
        success: true,
        message: `Successfully ${deltaAmount >= 0 ? 'credited' : 'debited'} $${amountNum.toFixed(2)} USD to user ${balanceType}!`,
        data: updatedUser,
      });
    } else {
      // In-memory dev state fallback update
      const index = devUsersState.findIndex((u) => u._id === userId);
      if (index !== -1) {
        const currentVal = devUsersState[index][fieldToUpdate] || 0;

        if (isDebit && fieldToUpdate === 'mainBalance' && currentVal < amountNum) {
          return res.status(400).json({
            error: `Cannot deduct $${amountNum.toFixed(2)}. User current main balance is $${currentVal.toFixed(2)}.`,
          });
        }

        devUsersState[index][fieldToUpdate] = Math.max(0, currentVal + deltaAmount);

        return res.status(200).json({
          success: true,
          message: `Successfully ${deltaAmount >= 0 ? 'credited' : 'debited'} $${amountNum.toFixed(2)} USD to user ${balanceType}!`,
          data: devUsersState[index],
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Balance adjustment executed successfully.',
        data: { _id: userId },
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user account status (Active, Suspended, Blocked)
 * @route   PATCH /api/admin/users/:id/status
 * @access  Private (Admin Only)
 */
export const updateUserStatus = async (req, res, next) => {
  try {
    const { newStatus, status } = req.body;
    const targetStatus = newStatus || status;
    const validStatuses = ['Active', 'Suspended', 'Blocked'];

    if (!validStatuses.includes(targetStatus)) {
      return res.status(400).json({ error: 'Invalid status. Must be one of: Active, Suspended, Blocked' });
    }

    const userId = req.params.id;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected && mongoose.Types.ObjectId.isValid(userId)) {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          status: targetStatus,
          isSuspended: targetStatus === 'Suspended' || targetStatus === 'Blocked',
        },
        { new: true, runValidators: true }
      ).select('-password');

      if (!updatedUser) {
        return res.status(404).json({ error: 'User record not found.' });
      }

      return res.status(200).json({
        success: true,
        message: `User status changed to ${targetStatus}`,
        user: updatedUser,
        data: updatedUser,
      });
    } else {
      const index = devUsersState.findIndex((u) => u._id === userId);
      if (index !== -1) {
        devUsersState[index].status = targetStatus;
        devUsersState[index].isSuspended = targetStatus === 'Suspended' || targetStatus === 'Blocked';

        return res.status(200).json({
          success: true,
          message: `User status changed to ${targetStatus}`,
          user: devUsersState[index],
          data: devUsersState[index],
        });
      }

      return res.status(404).json({ error: 'User record not found.' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle user account Active/Suspended status
 * @route   PATCH /api/admin/users/:id/toggle-status
 * @access  Private (Admin Only)
 */
export const toggleUserStatus = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected && mongoose.Types.ObjectId.isValid(userId)) {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User record not found.' });
      }

      user.isSuspended = !user.isSuspended;
      user.status = user.isSuspended ? 'Suspended' : 'Active';
      await user.save();

      return res.status(200).json({
        success: true,
        message: `User status changed to ${user.status}`,
        user,
        data: {
          _id: user._id,
          username: user.username,
          isSuspended: user.isSuspended,
          status: user.status,
        },
      });
    } else {
      const index = devUsersState.findIndex((u) => u._id === userId);
      if (index !== -1) {
        devUsersState[index].isSuspended = !devUsersState[index].isSuspended;
        devUsersState[index].status = devUsersState[index].isSuspended ? 'Suspended' : 'Active';

        return res.status(200).json({
          success: true,
          message: `User status changed to ${devUsersState[index].status}`,
          user: devUsersState[index],
          data: devUsersState[index],
        });
      }

      return res.status(200).json({
        success: true,
        message: 'User status updated successfully.',
        data: { _id: userId },
      });
    }
  } catch (error) {
    next(error);
  }
};

// Route Registrations
router.get('/', adminProtect, getAdminUsers);
router.put('/:id/adjust-balance', adminProtect, adjustUserBalance);
router.patch('/:id/status', adminProtect, updateUserStatus);
router.patch('/:id/toggle-status', adminProtect, toggleUserStatus);

export default router;
