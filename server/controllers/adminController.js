import User from '../models/User.js';
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
const generateAdminToken = (id) => {
  return jwt.sign(
    { id, role: 'admin' },
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

      if (!user || user.role !== 'admin') {
        return res.status(401).json({
          error: 'Access denied. Invalid administrative credentials.',
        });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          error: 'Access denied. Invalid administrative credentials.',
        });
      }

      const token = generateAdminToken(user._id);

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
          role: user.role,
        },
      });
    } else {
      console.warn('[Database Notice] MongoDB is offline. Processing admin login in dev fallback mode.');

      const devAdmin = inMemoryDevAdminUsers.find(
        (u) => u.email === identifier || u.username === identifier
      );

      if (!devAdmin || devAdmin.role !== 'admin') {
        return res.status(401).json({
          error: 'Access denied. Invalid administrative credentials.',
        });
      }

      const isMatch = await bcrypt.compare(password, devAdmin.password);
      if (!isMatch) {
        return res.status(401).json({
          error: 'Access denied. Invalid administrative credentials.',
        });
      }

      const token = generateAdminToken(devAdmin._id);

      return res.status(200).json({
        success: true,
        message: 'Administrative authentication successful.',
        token,
        user: {
          _id: devAdmin._id,
          firstName: devAdmin.firstName,
          lastName: devAdmin.lastName,
          username: devAdmin.username,
          email: devAdmin.email,
          role: devAdmin.role,
        },
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
    let todayJoinUser = 0;
    let totalUserFund = 0;
    let totalInterestFund = 0;
    let totalPlans = 10;
    let totalInvestment = 0;
    let runningInvestment = 0;
    let totalDepositAmount = 0;
    let pendingPayoutRequest = 0;
    let latestUsers = [];

    if (isMongoConnected) {
      // Import models dynamically if not top-level
      const Deposit = (await import('../models/Deposit.js')).default;
      const Payout = (await import('../models/Payout.js')).default;
      const Investment = (await import('../models/Investment.js')).default;

      totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
      activeUsers = await User.countDocuments({ status: 'Active', role: { $ne: 'admin' } });

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

      totalInvestment = await Investment.countDocuments({});
      runningInvestment = await Investment.countDocuments({ activeStatus: true });

      const depAgg = await Deposit.aggregate([
        { $match: { status: 'Approved' } },
        { $group: { _id: null, total: { $sum: '$requestedAmount' } } },
      ]);
      totalDepositAmount = depAgg[0]?.total || 0;

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
      todayDepositAmount: 0,
      totalDepositAmount,
      totalDeposit: totalDepositAmount,
      depositedCharge: 0,
      pendingPayoutRequest,
      todayPayoutAmount: 0,
      thisMonthPayoutAmount: 0,
      thisMonthPayoutCharge: 0,
      closedTickets: 0,
      repliedTickets: 0,
      answeredTickets: 0,
      pendingTickets: 0,
      monthSummaryChart: [
        { day: '01 Jul', investments: 200, deposits: 300, returnProfit: 50, payout: 0 },
        { day: '05 Jul', investments: 450, deposits: 800, returnProfit: 120, payout: 100 },
        { day: '10 Jul', investments: 800, deposits: 1200, returnProfit: 250, payout: 200 },
        { day: '15 Jul', investments: 1100, deposits: 2400, returnProfit: 410, payout: 350 },
        { day: '20 Jul', investments: 1200, deposits: totalDepositAmount || 3780, returnProfit: 600, payout: 500 },
      ],
      planSalePieChart: [
        { name: 'Shiba Inu (SHIB)', value: 35, color: '#FF5A1F' },
        { name: 'Cardano (ADA)', value: 25, color: '#3B82F6' },
        { name: 'Polygon (MATIC)', value: 20, color: '#8B5CF6' },
        { name: 'Avalanche (AVAX)', value: 12, color: '#EF4444' },
        { name: 'Dogecoin (DOGE)', value: 8, color: '#F59E0B' },
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

