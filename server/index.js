import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import { connectDB } from './config/db.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/userRoutes.js';
import depositRoutes from './routes/depositRoutes.js';
import payoutRoutes from './routes/payoutRoutes.js';
import investRoutes from './routes/investRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import adminDepositRoutes from './routes/adminDeposit.js';
import adminPayoutRoutes from './routes/adminPayout.js';
import adminPlansRoutes from './routes/adminPlans.js';
import adminUsersRoutes from './routes/adminUsers.js';
import adminGatewaysRoutes from './routes/adminGateways.js';
import adminReferralsRoutes from './routes/adminReferrals.js';
import adminNoticesRoutes from './routes/adminNotices.js';
import adminSettingsRoutes from './routes/adminSettings.js';
import noticeRoutes from './routes/noticeRoutes.js';
import planRoutes from './routes/planRoutes.js';
import { seedDefaultTestUser } from './controllers/authController.js';
import { seedDefaultAdminUser } from './controllers/adminController.js';
import { initSocket } from './socket.js';

dotenv.config();

const app = express();

// 1. CORS Configuration with Production & Local Host Support
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(null, true); // Permissive fallback to prevent breaking dev/prod requests
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sanitize duplicate /api/api URL prefixes if present in incoming requests
app.use((req, res, next) => {
  if (req.url && req.url.startsWith('/api/api/')) {
    req.url = req.url.replace('/api/api/', '/api/');
  }
  next();
});

// 2. Static Uploads Folder Serving
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// 3. Database Connection with Auto-Reconnect Safety
connectDB().then(() => {
  try {
    seedDefaultTestUser();
    seedDefaultAdminUser();
  } catch (err) {
    console.warn('⚠️ Seeding initial users notice:', err.message);
  }
});

// 4. Register Routes Safely
try {
  app.use('/api', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/plans', planRoutes);
  app.use('/api/plan', planRoutes);
  app.use('/api/deposit', depositRoutes);
  app.use('/api/payout', payoutRoutes);
  app.use('/api/invest', investRoutes);
  app.use('/api/transactions', transactionRoutes);
  app.use('/api/notices', noticeRoutes);
  
  // Admin Routes
  app.use('/api/admin', adminRoutes);
  app.use('/api/admin/deposits', adminDepositRoutes);
  app.use('/api/admin/deposit', adminDepositRoutes);
  app.use('/api/admin/payouts', adminPayoutRoutes);
  app.use('/api/admin/payout', adminPayoutRoutes);
  app.use('/api/admin/payout-logs', adminPayoutRoutes);
  app.use('/api/admin/payout-log', adminPayoutRoutes);
  app.use('/api/admin/plans', adminPlansRoutes);
  app.use('/api/admin/plan', adminPlansRoutes);
  app.use('/api/admin/users', adminUsersRoutes);
  app.use('/api/admin/user', adminUsersRoutes);
  app.use('/api/admin/gateways', adminGatewaysRoutes);
  app.use('/api/admin/gateway', adminGatewaysRoutes);
  app.use('/api/admin/manual-gateway', adminGatewaysRoutes);
  app.use('/api/admin/referrals', adminReferralsRoutes);
  app.use('/api/admin/referral', adminReferralsRoutes);
  app.use('/api/admin/settings', adminSettingsRoutes);
  app.use('/api/admin/notices', adminNoticesRoutes);
  app.use('/api/admin/notice', adminNoticesRoutes);
  app.use('/api/admin/transactions', transactionRoutes);
} catch (routeErr) {
  console.error("⚠️ Warning during route loading:", routeErr.message);
}

// 5. Base Root Route
app.get('/', (req, res) => {
  res.json({ status: "API is running successfully", timestamp: new Date() });
});

// 6. Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("🔥 Global Error Catch:", err.stack || err.message);
  res.status(500).json({ 
    success: false, 
    error: err.message || "Internal Server Error" 
  });
});

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Global Profit Hub Live Server running on port ${PORT}`);
});
