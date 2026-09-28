import mongoose from 'mongoose';

const payoutSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
    },
    selectedWallet: {
      type: String,
      default: 'Deposit Balance - $45',
    },
    gatewayType: {
      type: String,
      required: true,
      default: 'USDT BEP20',
    },
    rawAmount: {
      type: Number,
      required: true,
    },
    derivedFees: {
      type: Number,
      required: true,
    },
    finalDeductionAmount: {
      type: Number,
      required: true,
    },
    recipientWalletAddress: {
      type: String,
      required: true,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Payout', payoutSchema);
