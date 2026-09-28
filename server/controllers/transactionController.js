import Transaction from '../models/Transaction.js';
import mongoose from 'mongoose';

// In-memory dev storage pre-seeded with exact test logs from image_3cf5fe.png
export const inMemoryDevTransactions = [
  {
    _id: 'tx_dev_1',
    userId: 'john_user',
    uniqueTxId: '1X13UBKX71KT',
    amount: -40,
    amountString: '-40 USD',
    remarkDescription: 'Withdraw Via USDT ( BP 20 )',
    type: 'debit',
    createdAt: new Date('2026-07-20T17:35:00Z').toISOString(),
  },
  {
    _id: 'tx_dev_2',
    userId: 'john_user',
    uniqueTxId: '4K3Y6GQVUAZK',
    amount: -50,
    amountString: '-50 USD',
    remarkDescription: 'Withdraw Via USDT ( BP 20 )',
    type: 'debit',
    createdAt: new Date('2026-07-20T17:32:00Z').toISOString(),
  },
  {
    _id: 'tx_dev_3',
    userId: 'john_user',
    uniqueTxId: '09KBCBGZ8FU4',
    amount: 100,
    amountString: '+100 USD',
    remarkDescription: '100 USD Payment Amount Has Been Approved',
    type: 'credit',
    createdAt: new Date('2026-07-20T16:26:00Z').toISOString(),
  },
  {
    _id: 'tx_dev_4',
    userId: 'john_user',
    uniqueTxId: '1FBRCU60398T',
    amount: -20,
    amountString: '-20 USD',
    remarkDescription: 'Invested On Polygon 🟢 ( MATIC )',
    type: 'debit',
    createdAt: new Date('2026-07-20T16:25:00Z').toISOString(),
  },
];

/**
 * @desc    Get user transaction ledger history
 * @route   GET /api/transactions/my-ledger
 * @access  Private (JWT Protected)
 */
export const getMyLedger = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : null;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized user session.' });
    }

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      const txs = await Transaction.find({ userId }).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        transactions: txs,
        data: txs,
      });
    } else {
      const userDevTxs = inMemoryDevTransactions.filter((tx) => tx.userId === userId);

      return res.status(200).json({
        success: true,
        transactions: userDevTxs,
        data: userDevTxs,
      });
    }
  } catch (error) {
    next(error);
  }
};
