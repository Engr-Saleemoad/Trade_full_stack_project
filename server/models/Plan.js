import mongoose from 'mongoose';

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
    },
    tokenSymbol: {
      type: String,
      required: [true, 'Token symbol is required'],
      uppercase: true,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Minimum price amount is required'],
      min: [1, 'Price must be greater than 0'],
    },
    dailyReturnPercentage: {
      type: Number,
      required: [true, 'Daily return percentage is required'],
      min: [0.1, 'Return percentage must be greater than 0'],
    },
    frequency: {
      type: String,
      default: 'Every 24 Hours',
    },
    capitalBack: {
      type: Boolean,
      default: true,
    },
    badgeTag: {
      type: String,
      default: 'HOT',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    totalSubscribers: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Plan', planSchema);
