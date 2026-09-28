import mongoose from 'mongoose';

const gatewaySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Gateway name is required'],
      trim: true,
    },
    currency: {
      type: String,
      required: [true, 'Asset currency symbol is required'],
      uppercase: true,
      trim: true,
      default: 'USDT',
    },
    network: {
      type: String,
      required: [true, 'Blockchain network name is required'],
      trim: true,
      default: 'BEP20',
    },
    walletAddress: {
      type: String,
      required: [true, 'Receiving wallet address is required'],
      trim: true,
    },
    videoGuideUrl: {
      type: String,
      default: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    },
    minAmount: {
      type: Number,
      default: 10,
    },
    maxAmount: {
      type: Number,
      default: 10000,
    },
    fixedCharge: {
      type: Number,
      default: 0,
    },
    percentCharge: {
      type: Number,
      default: 0,
    },
    instruction: {
      type: String,
      default: 'Send exact amount to this wallet address. Upload payment screenshot for verification.',
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

export default mongoose.model('Gateway', gatewaySchema);
