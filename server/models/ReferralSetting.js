import mongoose from 'mongoose';

const referralSettingSchema = new mongoose.Schema(
  {
    levels: [
      {
        levelNumber: { type: Number, required: true },
        percentage: { type: Number, required: true },
      },
    ],
    triggerType: {
      type: String,
      enum: ['On User Deposit', 'On Plan Purchase'],
      default: 'On Plan Purchase',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('ReferralSetting', referralSettingSchema);
