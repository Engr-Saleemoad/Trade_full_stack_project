import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    planId: {
      type: String,
      default: '',
    },
    planName: {
      type: String,
      required: true,
      default: 'Polygon 🟢 (MATIC)',
    },
    price: {
      type: Number,
      required: true,
      default: 20,
    },
    investmentAmount: {
      type: Number,
      required: true,
      default: 20,
    },
    dailyReturnPercentage: {
      type: Number,
      default: 5,
    },
    profitPercentage: {
      type: Number,
      default: 5,
    },
    dailyReturnAmount: {
      type: Number,
      default: 1.0,
    },
    calculatedDailyPayout: {
      type: Number,
      default: 1.0,
    },
    dynamicTimerStartTimestamp: {
      type: Date,
      default: Date.now,
    },
    nextClaimTime: {
      type: Date,
      required: true,
    },
    nextPayoutTimestamp: {
      type: Date,
      required: true,
    },
    totalClaimsProcessed: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: 'Active',
    },
    activeStatus: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Investment', investmentSchema);
