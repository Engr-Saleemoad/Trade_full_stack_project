import mongoose from 'mongoose';

const depositSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    requestedAmount: {
      type: Number,
      required: true,
    },
    gatewayType: {
      type: String,
      required: true,
      default: 'USDT BEP20',
    },
    walletAddress: {
      type: String,
      default: '0x86A04560103588BFA89B478E09F6d89C0C858eEB',
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    proofImage: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Deposit', depositSchema);
