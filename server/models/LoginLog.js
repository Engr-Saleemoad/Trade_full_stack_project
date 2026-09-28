import mongoose from 'mongoose';

const loginLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
    userAgent: {
      type: String,
    },
    deviceDetails: {
      type: String,
      default: 'Unknown Device',
    },
    browser: {
      type: String,
      default: 'Unknown Browser',
    },
    os: {
      type: String,
      default: 'Unknown OS',
    },
    city: {
      type: String,
      default: 'Local City',
    },
    country: {
      type: String,
      default: 'Local Country',
    },
    loginTime: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const LoginLog = mongoose.models.LoginLog || mongoose.model('LoginLog', loginLogSchema);

export default LoginLog;
