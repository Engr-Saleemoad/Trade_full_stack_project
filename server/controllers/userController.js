import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import MoneyTransfer from '../models/MoneyTransfer.js';
import LoginLog from '../models/LoginLog.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { emitRealtimeEvent } from '../socket.js';

/**
 * @desc    Get dashboard statistics for authenticated user
 * @route   GET /api/user/dashboard-stats
 * @access  Private (JWT Protected)
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;
    const userId = req.user ? (req.user.id || req.user._id) : null;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized user session.' });
    }

    if (isMongoConnected) {
      let user = null;
      if (mongoose.Types.ObjectId.isValid(userId)) {
        user = await User.findById(userId).select('-password');
      }

      if (user) {
        return res.status(200).json({
          success: true,
          data: {
            username: user.username,
            mainBalance: user.mainBalance || 0,
            interestBalance: user.interestBalance || 0,
            totalDeposit: user.totalDeposit || 0,
            totalEarn: user.totalEarn || 0,
            totalInvest: user.totalInvest || 0,
            totalPayout: user.totalPayout || 0,
            totalReferralBonus: user.totalReferralBonus || 0,
            totalTickets: user.totalTickets || 0,
            lastReferralBonus: user.lastReferralBonus || 0,
          referralUrl: `https://trade-full-stack-project.vercel.app/register/${user.username}`,
            investCompletedPercent: 0,
            roiSpeedPercent: 100,
            roiRedeemedPercent: 0,
            chartData: [
              { month: 'Jan', investment: 0, payout: 0, deposit: 0, depositBonus: 0, investmentBonus: 0 },
              { month: 'Feb', investment: 0, payout: 0, deposit: 0, depositBonus: 0, investmentBonus: 0 },
              { month: 'Mar', investment: 0, payout: 0, deposit: 0, depositBonus: 0, investmentBonus: 0 },
              { month: 'Apr', investment: 0, payout: 0, deposit: 0, depositBonus: 0, investmentBonus: 0 },
              { month: 'May', investment: 0, payout: 0, deposit: 0, depositBonus: 0, investmentBonus: 0 },
              { month: 'Jun', investment: 0, payout: 0, deposit: 0, depositBonus: 0, investmentBonus: 0 },
              { month: 'Jul', investment: 0, payout: 0, deposit: 0, depositBonus: 0, investmentBonus: 0 },
              { month: 'Aug', investment: 0, payout: 0, deposit: 0, depositBonus: 0, investmentBonus: 0 },
              { month: 'Sep', investment: 0, payout: 0, deposit: 0, depositBonus: 0, investmentBonus: 0 },
              { month: 'Oct', investment: 0, payout: 0, deposit: 0, depositBonus: 0, investmentBonus: 0 },
              { month: 'Nov', investment: 0, payout: 0, deposit: 0, depositBonus: 0, investmentBonus: 0 },
              { month: 'Dec', investment: 0, payout: 0, deposit: 0, depositBonus: 0, investmentBonus: 0 },
            ],
          },
        });
      }
    }

    return res.status(404).json({ error: 'User record not found.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get authenticated user profile details
 * @route   GET /api/user/profile
 * @access  Private (JWT Protected)
 */
export const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : null;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized user session.' });
    }

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected && mongoose.Types.ObjectId.isValid(userId)) {
      const user = await User.findById(userId).select('-password');
      if (user) {
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
        const profileObj = {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName,
          username: user.username,
          email: user.email,
          mainBalance: user.mainBalance || 0,
          interestBalance: user.interestBalance || 0,
          totalDeposit: user.totalDeposit || 0,
          totalEarn: user.totalEarn || 0,
          totalInvest: user.totalInvest || 0,
          totalPayout: user.totalPayout || 0,
          totalReferralBonus: user.totalReferralBonus || 0,
          country: user.country || 'Afghanistan (+93)',
          phone: user.phone || 'N/A',
          status: user.status || (user.isSuspended ? 'Suspended' : 'Active'),
          referralUrl: `https://trade-full-stack-project.vercel.app/register/${user.username}`,
          createdAt: user.createdAt,
        };
        return res.status(200).json({
          success: true,
          user: profileObj,
          data: profileObj,
        });
      }
    }

    return res.status(404).json({ error: 'User profile not found.' });
  } catch (error) {
    next(error);
  }
};



/**
 * @desc    Change user password
 * @route   POST /api/user/change-password
 * @access  Private (JWT Protected)
 */
export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : null;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized user session.' });
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'Please provide all password fields.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New password and confirm password do not match.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected && mongoose.Types.ObjectId.isValid(userId)) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User record not found.' });
      }

      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect.' });
      }

      user.password = newPassword;
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Password changed successfully!',
      });
    }

    return res.status(400).json({ error: 'Database error. Password change failed.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Secure User-to-User Balance Transfer
 * @route   POST /api/user/transfer
 * @access  Private (JWT Protected)
 */
export const transferBalance = async (req, res, next) => {
  try {
    const senderId = req.user ? (req.user.id || req.user._id) : null;
    const { recipientUsername, recipientEmail, amount } = req.body;

    if (!senderId) {
      return res.status(401).json({ error: 'Unauthorized user session.' });
    }

    const targetRecipient = (recipientUsername || recipientEmail || '').trim().toLowerCase();
    const transferAmount = Number(amount);

    if (!targetRecipient) {
      return res.status(400).json({ error: 'Please enter recipient username or email.' });
    }

    if (isNaN(transferAmount) || transferAmount <= 0) {
      return res.status(400).json({ error: 'Please enter a valid transfer amount greater than 0.' });
    }

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      const sender = await User.findById(senderId);
      if (!sender) {
        return res.status(404).json({ error: 'Sender user record not found.' });
      }

      if ((sender.mainBalance || 0) < transferAmount) {
        return res.status(400).json({
          error: `Insufficient balance. Your available main balance is $${(sender.mainBalance || 0).toFixed(2)} USD.`,
        });
      }

      const recipient = await User.findOne({
        $or: [{ username: targetRecipient }, { email: targetRecipient }],
      });

      if (!recipient) {
        return res.status(404).json({ error: 'Recipient user account not found.' });
      }

      if (sender._id.toString() === recipient._id.toString()) {
        return res.status(400).json({ error: 'Self-transfer is not permitted.' });
      }

      // Atomic Balance Mutation
      sender.mainBalance -= transferAmount;
      await sender.save();

      recipient.mainBalance = (recipient.mainBalance || 0) + transferAmount;
      await recipient.save();

      const timestamp = Date.now();
      const senderTxId = `TRFS-${timestamp}`;
      const recipientTxId = `TRFR-${timestamp}`;

      // Dual Transaction Logs
      const senderLog = await Transaction.create({
        userId: sender._id.toString(),
        uniqueTxId: senderTxId,
        amount: transferAmount,
        amountString: `-$${transferAmount.toFixed(2)} USD`,
        remarkDescription: `Balance Transfer to ${recipient.username}`,
        type: 'debit',
      });

      const recipientLog = await Transaction.create({
        userId: recipient._id.toString(),
        uniqueTxId: recipientTxId,
        amount: transferAmount,
        amountString: `+$${transferAmount.toFixed(2)} USD`,
        remarkDescription: `Balance Transfer from ${sender.username}`,
        type: 'credit',
      });

      // Emit real-time balance update sockets
      emitRealtimeEvent('balance_updated', { userId: sender._id.toString(), balance: sender.mainBalance });
      emitRealtimeEvent('balance_updated', { userId: recipient._id.toString(), balance: recipient.mainBalance });

      return res.status(200).json({
        success: true,
        message: `Successfully transferred $${transferAmount.toFixed(2)} USD to ${recipient.username}!`,
        newBalance: sender.mainBalance,
        senderTransaction: senderLog,
        recipientTransaction: recipientLog,
      });
    }

    return res.status(400).json({ error: 'Database connection offline. Transfer failed.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Lookup recipient user by username, email, or phone
 * @route   GET /api/user/lookup?query=<term>
 * @access  Private (JWT Protected)
 */
export const lookupUser = async (req, res, next) => {
  try {
    const queryTerm = (req.query.query || '').trim();
    if (!queryTerm) {
      return res.status(400).json({ error: 'Please enter a username, email, or phone number to lookup.' });
    }

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      const user = await User.findOne({
        $or: [
          { username: { $regex: `^${queryTerm}$`, $options: 'i' } },
          { email: { $regex: `^${queryTerm}$`, $options: 'i' } },
          { phone: { $regex: `^${queryTerm}$`, $options: 'i' } },
        ],
      }).select('_id firstName lastName username email phone country status');

      if (!user) {
        return res.status(404).json({ error: 'Recipient user account not found.' });
      }

      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;

      return res.status(200).json({
        success: true,
        user: {
          _id: user._id,
          fullName,
          username: user.username,
          email: user.email,
          phone: user.phone || 'N/A',
          country: user.country || 'N/A',
          isVerified: true,
        },
      });
    }

    return res.status(400).json({ error: 'Database offline. User lookup unavailable.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit P2P Money Transfer Request for Admin Approval
 * @route   POST /api/user/transfer-request
 * @access  Private (JWT Protected)
 */
export const requestMoneyTransfer = async (req, res, next) => {
  try {
    const senderId = req.user ? (req.user.id || req.user._id) : null;
    const { recipientUsername, recipientEmail, recipientId, amount } = req.body;

    if (!senderId) {
      return res.status(401).json({ error: 'Unauthorized user session.' });
    }

    const transferAmount = Number(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      return res.status(400).json({ error: 'Please enter a valid transfer amount greater than 0.' });
    }

    const targetQuery = (recipientUsername || recipientEmail || '').trim();

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      const sender = await User.findById(senderId);
      if (!sender) {
        return res.status(404).json({ error: 'Sender user record not found.' });
      }

      if ((sender.mainBalance || 0) < transferAmount) {
        return res.status(400).json({
          error: `Insufficient balance. Available main balance is $${(sender.mainBalance || 0).toFixed(2)} USD.`,
        });
      }

      let recipient = null;
      if (recipientId && mongoose.Types.ObjectId.isValid(recipientId)) {
        recipient = await User.findById(recipientId);
      } else if (targetQuery) {
        recipient = await User.findOne({
          $or: [
            { username: { $regex: `^${targetQuery}$`, $options: 'i' } },
            { email: { $regex: `^${targetQuery}$`, $options: 'i' } },
          ],
        });
      }

      if (!recipient) {
        return res.status(404).json({ error: 'Recipient user account not found.' });
      }

      if (sender._id.toString() === recipient._id.toString()) {
        return res.status(400).json({ error: 'Self-transfer is not permitted.' });
      }

      // Create Pending MoneyTransfer Record
      const moneyTransfer = await MoneyTransfer.create({
        senderId: sender._id,
        recipientId: recipient._id,
        amount: transferAmount,
        status: 'Pending',
      });

      // Emit Realtime socket notice for Admin
      emitRealtimeEvent('transfer_created', moneyTransfer);

      return res.status(200).json({
        success: true,
        message: 'Transfer request submitted to admin for approval.',
        transfer: moneyTransfer,
      });
    }

    return res.status(400).json({ error: 'Database connection offline. Request failed.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user login session logs
 * @route   GET /api/user/login-logs
 * @access  Private (User Auth)
 */
export const getLoginLogs = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : null;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected && userId) {
      const logs = await LoginLog.find({ userId }).sort({ loginTime: -1 }).limit(30);
      return res.status(200).json({ success: true, count: logs.length, data: logs });
    }

    return res.status(200).json({ success: true, count: 0, data: [] });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all login logs for Admin
 * @route   GET /api/admin/login-logs
 * @access  Private (Admin Auth)
 */
export const getAllLoginLogsAdmin = async (req, res, next) => {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      const rawLogs = await LoginLog.find().sort({ loginTime: -1 }).limit(100);
      const populated = await Promise.all(
        rawLogs.map(async (log) => {
          const item = log.toObject();
          if (!item.username && item.userId && mongoose.Types.ObjectId.isValid(item.userId)) {
            const u = await User.findById(item.userId).select('username email');
            if (u) {
              item.username = u.username;
              item.email = u.email;
            }
          }
          item.username = item.username || 'Investor';
          item.location = item.city && item.country ? `${item.city}, ${item.country}` : (item.country || 'Global');
          return item;
        })
      );
      return res.status(200).json({ success: true, count: populated.length, data: populated });
    }

    return res.status(200).json({ success: true, count: 0, data: [] });
  } catch (error) {
    next(error);
  }
};
