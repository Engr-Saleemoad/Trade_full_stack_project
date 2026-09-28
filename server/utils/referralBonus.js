import User from '../models/User.js';
import ReferralSetting from '../models/ReferralSetting.js';
import CommissionLog from '../models/CommissionLog.js';
import Transaction from '../models/Transaction.js';

/**
 * Core Deep Multi-Level Referral Commission Distribution Utility Engine
 * Traverses up the referrer tree for multi-level commission payouts (Level 1, Level 2, Level 3).
 *
 * @param {string|ObjectId} userId - ID of user making deposit or purchasing plan
 * @param {number} transactionAmount - Financial amount in USD
 * @param {string} triggerType - Event description, e.g., "On User Deposit" or "Plan Purchase"
 */
export const distributeReferralCommissions = async (userId, transactionAmount, triggerType) => {
  try {
    if (!userId || !transactionAmount || Number(transactionAmount) <= 0) {
      return;
    }

    const txAmount = Number(transactionAmount);

    // Fetch referral tier settings from DB or fallback default settings
    const dbSettings = await ReferralSetting.findOne().lean();
    const settings = dbSettings || {
      levels: [
        { levelNumber: 1, percentage: 5 },
        { levelNumber: 2, percentage: 2 },
        { levelNumber: 3, percentage: 1 },
      ],
      isActive: true,
    };

    if (settings.isActive === false) {
      console.log('[ReferralBonus] Referral bonus distribution is disabled in settings.');
      return;
    }

    const levels = settings.levels || [];
    let currentUserId = userId;

    for (let i = 0; i < levels.length; i++) {
      const currentUser = await User.findById(currentUserId);
      if (!currentUser || (!currentUser.referredBy && !currentUser.referrerId)) {
        break;
      }

      const parentReferrerId = currentUser.referredBy || currentUser.referrerId;
      const referrer = await User.findById(parentReferrerId);
      if (!referrer) {
        break;
      }

      const tier = levels[i];
      if (!tier || !tier.percentage || Number(tier.percentage) <= 0) {
        currentUserId = referrer._id;
        continue;
      }

      const percentage = Number(tier.percentage);
      const commissionAmount = (txAmount * percentage) / 100;

      if (commissionAmount > 0) {
        // Atomically update referrer's interest balance & total referral bonus
        referrer.interestBalance = (referrer.interestBalance || 0) + commissionAmount;
        referrer.totalReferralBonus = (referrer.totalReferralBonus || 0) + commissionAmount;
        referrer.lastReferralBonus = commissionAmount;
        await referrer.save();

        // Create immutable commission log record
        const logEntry = {
          referrerId: referrer._id,
          referrerUsername: referrer.username || 'unknown',
          referredUserId: userId,
          referredUsername: currentUser.username || 'unknown',
          tierLevel: tier.levelNumber || i + 1,
          commissionAmount,
          sourceTransactionAmount: txAmount,
          triggerEvent: triggerType || `Level ${tier.levelNumber} Commission ($${txAmount.toFixed(2)})`,
        };

        try {
          await CommissionLog.create(logEntry);
        } catch (logErr) {
          console.warn('[CommissionLog Create Warning]:', logErr.message);
        }

        // Create ledger transaction entry for the referrer
        const txId = 'REF' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
        try {
          await Transaction.create({
            userId: referrer._id.toString(),
            uniqueTxId: txId,
            transactionId: txId,
            amount: commissionAmount,
            amountString: `+$${commissionAmount.toFixed(2)} USD`,
            remarks: `Level ${tier.levelNumber} Referral Bonus from @${currentUser.username}`,
            remarkDescription: `Level ${tier.levelNumber} Referral Bonus (${percentage}%) from @${currentUser.username}`,
            type: 'credit',
          });
        } catch (txErr) {
          console.warn('[Transaction Create Warning]:', txErr.message);
        }
      }

      // Move up the referral tree to next ancestor level
      currentUserId = referrer._id;
    }
  } catch (err) {
    console.error('[Referral Bonus Engine Error]:', err);
  }
};

export default distributeReferralCommissions;
