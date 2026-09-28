import express from 'express';
import mongoose from 'mongoose';
import MoneyTransfer from '../models/MoneyTransfer.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { adminProtect } from '../middleware/authMiddleware.js';
import { emitRealtimeEvent } from '../socket.js';

const router = express.Router();

/**
 * @desc    Get all P2P transfer requests for Admin Portal
 * @route   GET /api/admin/transfers
 * @access  Private (Admin Only)
 */
export const getAdminTransfers = async (req, res, next) => {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      const transfers = await MoneyTransfer.find()
        .populate('senderId', 'username email fullName mainBalance')
        .populate('recipientId', 'username email fullName mainBalance')
        .sort({ createdAt: -1 })
        .lean();

      const formattedTransfers = transfers.map((item) => ({
        ...item,
        _id: item._id.toString(),
        sender: item.senderId || { username: 'Unknown Sender', email: 'N/A' },
        recipient: item.recipientId || { username: 'Unknown Recipient', email: 'N/A' },
      }));

      return res.status(200).json({
        success: true,
        count: formattedTransfers.length,
        transfers: formattedTransfers,
        data: formattedTransfers,
      });
    }

    return res.status(200).json({
      success: true,
      count: 0,
      transfers: [],
      data: [],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve P2P transfer request & execute atomic balance transfer
 * @route   PUT /api/admin/transfers/approve/:id
 * @access  Private (Admin Only)
 */
export const approveTransfer = async (req, res, next) => {
  try {
    const transferId = req.params.id;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected && mongoose.Types.ObjectId.isValid(transferId)) {
      const transfer = await MoneyTransfer.findById(transferId);

      if (!transfer) {
        return res.status(404).json({ error: 'Transfer request record not found.' });
      }

      if (transfer.status !== 'Pending') {
        return res.status(400).json({ error: `Transfer request is already ${transfer.status.toLowerCase()}.` });
      }

      const sender = await User.findById(transfer.senderId);
      const recipient = await User.findById(transfer.recipientId);

      if (!sender) {
        return res.status(404).json({ error: 'Sender user account no longer exists.' });
      }

      if (!recipient) {
        return res.status(404).json({ error: 'Recipient user account no longer exists.' });
      }

      const amountToTransfer = Number(transfer.amount);

      // Verify sender balance
      if ((sender.mainBalance || 0) < amountToTransfer) {
        return res.status(400).json({
          error: `Approval failed. Sender (@${sender.username}) only has $${(sender.mainBalance || 0).toFixed(2)} USD main balance available.`,
        });
      }

      // Atomic Balance Mutation
      sender.mainBalance -= amountToTransfer;
      await sender.save();

      recipient.mainBalance = (recipient.mainBalance || 0) + amountToTransfer;
      await recipient.save();

      // Update Transfer Status
      transfer.status = 'Approved';
      await transfer.save();

      // Create Dual Transaction Logs
      const timestamp = Date.now();
      const senderTxId = `TRFS-${timestamp}`;
      const recipientTxId = `TRFR-${timestamp}`;

      const senderLog = await Transaction.create({
        userId: sender._id.toString(),
        uniqueTxId: senderTxId,
        amount: -amountToTransfer,
        amountString: `-$${amountToTransfer.toFixed(2)} USD`,
        remarkDescription: `P2P Transfer to @${recipient.username} (Approved by Admin)`,
        type: 'debit',
      });

      const recipientLog = await Transaction.create({
        userId: recipient._id.toString(),
        uniqueTxId: recipientTxId,
        amount: amountToTransfer,
        amountString: `+$${amountToTransfer.toFixed(2)} USD`,
        remarkDescription: `P2P Transfer from @${sender.username} (Approved by Admin)`,
        type: 'credit',
      });

      // Emit Realtime Sockets
      emitRealtimeEvent('balance_updated', { userId: sender._id.toString(), balance: sender.mainBalance });
      emitRealtimeEvent('balance_updated', { userId: recipient._id.toString(), balance: recipient.mainBalance });
      emitRealtimeEvent('transfer_updated', transfer);

      return res.status(200).json({
        success: true,
        message: `Transfer of $${amountToTransfer.toFixed(2)} USD from @${sender.username} to @${recipient.username} approved!`,
        transfer,
        senderTransaction: senderLog,
        recipientTransaction: recipientLog,
      });
    }

    return res.status(400).json({ error: 'Database connection error. Approval failed.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject P2P transfer request
 * @route   PUT /api/admin/transfers/reject/:id
 * @access  Private (Admin Only)
 */
export const rejectTransfer = async (req, res, next) => {
  try {
    const transferId = req.params.id;
    const { reason } = req.body;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected && mongoose.Types.ObjectId.isValid(transferId)) {
      const transfer = await MoneyTransfer.findById(transferId);

      if (!transfer) {
        return res.status(404).json({ error: 'Transfer request record not found.' });
      }

      if (transfer.status !== 'Pending') {
        return res.status(400).json({ error: `Transfer request is already ${transfer.status.toLowerCase()}.` });
      }

      transfer.status = 'Rejected';
      if (reason) {
        transfer.rejectionReason = reason;
      }
      await transfer.save();

      emitRealtimeEvent('transfer_updated', transfer);

      return res.status(200).json({
        success: true,
        message: 'Transfer request rejected.',
        transfer,
      });
    }

    return res.status(400).json({ error: 'Database connection error. Rejection failed.' });
  } catch (error) {
    next(error);
  }
};

// Route registrations
router.get('/', adminProtect, getAdminTransfers);
router.put('/approve/:id', adminProtect, approveTransfer);
router.put('/reject/:id', adminProtect, rejectTransfer);

export default router;
