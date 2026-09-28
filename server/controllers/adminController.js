import User from '../models/User.js';
import SubAdmin from '../models/SubAdmin.js';
import Deposit from '../models/Deposit.js';
import Payout from '../models/Payout.js';
import Investment from '../models/Investment.js';
import Plan from '../models/Plan.js';
import { inMemoryDevSubAdmins } from './subAdminController.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Pre-hashed default admin password for 'Admin@123'
const defaultAdminPasswordHash = bcrypt.hashSync('Admin@123', 10);

// In-memory dev storage pre-seeded with fixed admin credentials (username: admin, password: Admin@123)
const inMemoryDevAdminUsers = [
  {
    _id: 'default_admin_user_001',
    firstName: 'System',
    lastName: 'Admin',
    username: 'admin',
    email: 'admin@globalprofithub.com',
    password: defaultAdminPasswordHash,
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
];

// Seed default admin user into MongoDB if connected
export const seedDefaultAdminUser = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      const existingAdmin = await User.findOne({
        $or: [{ username: 'admin' }, { email: 'admin@globalprofithub.com' }],
      });

      if (!existingAdmin) {
        await User.create({
          firstName: 'System',
          lastName: 'Administrator',
          username: 'admin',
          email: 'admin@globalprofithub.com',
          country: 'Global Admin (+00)',
          phone: '+1234567890',
          password: 'Admin@12345',
          role: 'admin',
          status: 'Active',
          mainBalance: 0,
          interestBalance: 0,
        });
        console.log('✅ Default admin account (admin / Admin@12345) created in MongoDB.');
      }
    }
  } catch (err) {
    console.warn('[Seed Warning] Could not seed default admin user:', err.message);
  }
};

/**
 * Helper function to generate Admin JWT token
 */
const generateAdminToken = (id, role = 'admin', permissions = null) => {
  const payload = { id, role };
  if (permissions) payload.permissions = permissions;
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'globalprofithub_supersecret_jwt_key_2026',
    { expiresIn: '30d' }
  );
};

/**
 * @desc    Authenticate Administrator & return Admin JWT token
 * @route   POST /api/admin/login
 * @access  Public
 */
export const adminLogin = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;
    const identifier = (email || username || '').trim().toLowerCase();

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Please provide email/username and password.' });
    }

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      const user = await User.findOne({
        $or: [{ email: identifier }, { username: identifier }],
      });

      if (user && user.role === 'admin') {
        const isMatch = await user.matchPassword(password);
        if (isMatch) {
          const token = generateAdminToken(user._id, 'admin');
          return res.status(200).json({
            success: true,
            message: 'Administrative authentication successful.',
            token,
            user: {
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              username: user.username,
              email: user.email,
              role: 'admin',
            },
          });
        }
      }

      // Check SubAdmin collection if master admin login failed
      const subAdmin = await SubAdmin.findOne({
        $or: [{ email: identifier }, { username: identifier }],
      });

      if (subAdmin) {
        const isMatch = await subAdmin.matchPassword(password);
        if (isMatch) {
          const token = generateAdminToken(subAdmin._id, 'sub-admin', subAdmin.permissions);
          return res.status(200).json({
            success: true,
            message: 'Sub-Admin authentication successful.',
            token,
            user: {
              _id: subAdmin._id,
              username: subAdmin.username,
              email: subAdmin.email,
              role: 'sub-admin',
              permissions: subAdmin.permissions,
            },
          });
        }
      }

      return res.status(401).json({
        error: 'Access denied. Invalid administrative credentials.',
      });
    } else {
      console.warn('[Database Notice] MongoDB is offline. Processing admin login in dev fallback mode.');

      const devAdmin = inMemoryDevAdminUsers.find(
        (u) => u.email === identifier || u.username === identifier
      );

      if (devAdmin && devAdmin.role === 'admin') {
        const isMatch = await bcrypt.compare(password, devAdmin.password);
        if (isMatch) {
          const token = generateAdminToken(devAdmin._id, 'admin');
          return res.status(200).json({
            success: true,
            message: 'Administrative authentication successful.',
            token,
            user: {
              _id: devAdmin._id,
              username: devAdmin.username,
              email: devAdmin.email,
              role: 'admin',
            },
          });
        }
      }

      const devSub = inMemoryDevSubAdmins.find(
        (u) => u.email === identifier || u.username === identifier
      );

      if (devSub) {
        const token = generateAdminToken(devSub._id, 'sub-admin', devSub.permissions);
        return res.status(200).json({
          success: true,
          message: 'Sub-Admin authentication successful.',
          token,
          user: {
            _id: devSub._id,
            username: devSub.username,
            email: devSub.email,
            role: 'sub-admin',
            permissions: devSub.permissions,
          },
        });
      }

      return res.status(401).json({
        error: 'Access denied. Invalid administrative credentials.',
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Administrative Dashboard Metrics & Aggregations
 * @route   GET /api/admin/dashboard-metrics
 * @access  Private (Admin JWT Protected)
 */
export const getAdminDashboardMetrics = async (req, res, next) => {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;

    let totalUsers = 0;
    let activeUsers = 0;
    let suspendedUsers = 0;
    let todayJoinUser = 0;
    let totalUserFund = 0;
    let totalInterestFund = 0;
    let totalPlans = 0;
    let totalInvestment = 0;
    let runningInvestment = 0;
    let totalDepositAmount = 0;
    let todayDepositAmount = 0;
    let totalPayoutAmount = 0;
    let todayPayoutAmount = 0;
    let pendingPayoutRequest = 0;
    let latestUsers = [];

    if (isMongoConnected) {
      totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
      activeUsers = await User.countDocuments({ status: 'Active', role: { $ne: 'admin' } });
      suspendedUsers = await User.countDocuments({
        role: { $ne: 'admin' },
        $or: [{ status: 'Suspended' }, { status: 'Blocked' }, { isSuspended: true }],
      });

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      todayJoinUser = await User.countDocuments({
        role: { $ne: 'admin' },
        createdAt: { $gte: startOfDay },
      });

      const userFundAgg = await User.aggregate([
        { $match: { role: { $ne: 'admin' } } },
        { $group: { _id: null, totalFund: { $sum: '$mainBalance' }, totalInterest: { $sum: '$interestBalance' } } },
      ]);

      if (userFundAgg && userFundAgg.length > 0) {
        totalUserFund = userFundAgg[0].totalFund || 0;
        totalInterestFund = userFundAgg[0].totalInterest || 0;
      }

      totalPlans = await Plan.countDocuments({});
      totalInvestment = await Investment.countDocuments({});
      runningInvestment = await Investment.countDocuments({
        $or: [{ activeStatus: true }, { status: 'Active' }],
      });

      // Deposits aggregation
      const depAgg = await Deposit.aggregate([
        { $match: { status: 'Approved' } },
        { $group: { _id: null, total: { $sum: '$requestedAmount' } } },
      ]);
      totalDepositAmount = depAgg[0]?.total || 0;

      const todayDepAgg = await Deposit.aggregate([
        { $match: { status: 'Approved', updatedAt: { $gte: startOfDay } } },
        { $group: { _id: null, total: { $sum: '$requestedAmount' } } },
      ]);
      todayDepositAmount = todayDepAgg[0]?.total || 0;

      // Payouts aggregation
      const payoutAgg = await Payout.aggregate([
        { $match: { status: 'Approved' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      totalPayoutAmount = payoutAgg[0]?.total || 0;

      const todayPayoutAgg = await Payout.aggregate([
        { $match: { status: 'Approved', updatedAt: { $gte: startOfDay } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      todayPayoutAmount = todayPayoutAgg[0]?.total || 0;

      pendingPayoutRequest = await Payout.countDocuments({ status: 'Pending' });

      const dbUsers = await User.find({ role: { $ne: 'admin' } })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      latestUsers = dbUsers.map((u) => ({
        id: u._id,
        _id: u._id,
        name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username,
        username: u.username,
        email: u.email,
        balance: u.mainBalance || 0,
        interestBalance: u.interestBalance || 0,
        status: u.status || (u.isSuspended ? 'Suspended' : 'Active'),
        createdAt: u.createdAt,
      }));
    }

    const responsePayload = {
      totalUsers,
      totalActiveUsers: activeUsers,
      activeUsers,
      suspendedUsers,
      todayJoinUser,
      totalUserFund,
      totalInterestFund,
      totalPlans,
      totalInvestment,
      runningInvestment,
      runningInvestments: runningInvestment,
      completeInvestment: Math.max(0, totalInvestment - runningInvestment),
      todayInvestCount: 0,
      todayInvestAmount: 0,
      thisMonthInvestAmount: 0,
      totalInvestAmount: 0,
      todayDepositAmount,
      totalDepositAmount,
      totalDeposit: totalDepositAmount,
      depositedCharge: 0,
      pendingPayoutRequest,
      todayPayoutAmount,
      totalPayoutAmount,
      thisMonthPayoutAmount: totalPayoutAmount,
      thisMonthPayoutCharge: 0,
      closedTickets: 0,
      repliedTickets: 0,
      answeredTickets: 0,
      pendingTickets: 0,
      monthSummaryChart: [
        { day: 'Start', investments: 0, deposits: totalDepositAmount, returnProfit: totalInterestFund, payout: totalPayoutAmount },
      ],
      planSalePieChart: [
        { name: 'Active Plans', value: runningInvestment || 1, color: '#FF5A1F' },
      ],
      latestUsers,
    };

    return res.status(200).json({
      success: true,
      metrics: responsePayload,
      data: responsePayload,
    });
  } catch (error) {
    next(error);
  }
};

