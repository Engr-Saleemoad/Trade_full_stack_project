import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    country: {
      type: String,
      default: 'Afghanistan (+93)',
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
    mainBalance: { type: Number, default: 0 },
    interestBalance: { type: Number, default: 0 },
    totalDeposit: { type: Number, default: 0 },
    totalEarn: { type: Number, default: 0 },
    totalInvest: { type: Number, default: 0 },
    totalPayout: { type: Number, default: 0 },
    totalReferralBonus: { type: Number, default: 0 },
    totalTickets: { type: Number, default: 0 },
    lastReferralBonus: { type: Number, default: 0 },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    referrerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    referralLevel: {
      type: Number,
      default: 0,
    },
    isSuspended: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['Active', 'Suspended', 'Blocked'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
