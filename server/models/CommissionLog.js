import mongoose from 'mongoose';

const commissionLogSchema = new mongoose.Schema(
  {
    referrerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    referrerUsername: {
      type: String,
      required: true,
    },
    referredUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    referredUsername: {
      type: String,
      required: true,
    },
    tierLevel: {
      type: Number,
      required: true,
    },
    commissionAmount: {
      type: Number,
      required: true,
    },
    sourceTransactionAmount: {
      type: Number,
      required: true,
    },
    triggerEvent: {
      type: String,
      default: 'Plan Purchase',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('CommissionLog', commissionLogSchema);
