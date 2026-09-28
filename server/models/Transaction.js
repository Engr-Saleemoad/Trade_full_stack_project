import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    uniqueTxId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true, // positive for credit, negative for debit
    },
    amountString: {
      type: String,
      required: true, // e.g. "-40 USD" or "+100 USD"
    },
    remarkDescription: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Transaction', transactionSchema);
