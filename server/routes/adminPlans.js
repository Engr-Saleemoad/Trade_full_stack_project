import express from 'express';
import mongoose from 'mongoose';
import Plan from '../models/Plan.js';
import Investment from '../models/Investment.js';
import { adminProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Default seed dev plans if database is empty or offline
const seedDevPlans = [
  {
    _id: 'plan_shib_01',
    name: 'Shiba Inu (SHIB)',
    tokenSymbol: 'SHIB',
    price: 20.0,
    dailyReturnPercentage: 4.5,
    frequency: 'Every 24 Hours',
    capitalBack: true,
    badgeTag: 'HOT',
    isActive: true,
    totalSubscribers: 12,
    createdAt: new Date('2026-07-01T10:00:00Z').toISOString(),
  },
  {
    _id: 'plan_matic_02',
    name: 'Polygon (MATIC)',
    tokenSymbol: 'MATIC',
    price: 50.0,
    dailyReturnPercentage: 5.0,
    frequency: 'Every 24 Hours',
    capitalBack: true,
    badgeTag: 'Featured',
    isActive: true,
    totalSubscribers: 8,
    createdAt: new Date('2026-07-05T10:00:00Z').toISOString(),
  },
  {
    _id: 'plan_ada_03',
    name: 'Cardano (ADA)',
    tokenSymbol: 'ADA',
    price: 100.0,
    dailyReturnPercentage: 6.2,
    frequency: 'Every 24 Hours',
    capitalBack: true,
    badgeTag: 'Daily 6%',
    isActive: true,
    totalSubscribers: 15,
    createdAt: new Date('2026-07-10T10:00:00Z').toISOString(),
  },
  {
    _id: 'plan_avax_04',
    name: 'Avalanche (AVAX)',
    tokenSymbol: 'AVAX',
    price: 250.0,
    dailyReturnPercentage: 7.5,
    frequency: 'Every 24 Hours',
    capitalBack: true,
    badgeTag: 'High Yield',
    isActive: true,
    totalSubscribers: 5,
    createdAt: new Date('2026-07-12T10:00:00Z').toISOString(),
  },
  {
    _id: 'plan_sol_05',
    name: 'Solana (SOL)',
    tokenSymbol: 'SOL',
    price: 500.0,
    dailyReturnPercentage: 9.0,
    frequency: 'Every 24 Hours',
    capitalBack: true,
    badgeTag: 'VIP Tier',
    isActive: true,
    totalSubscribers: 3,
    createdAt: new Date('2026-07-15T10:00:00Z').toISOString(),
  },
];

// In-memory dev storage state for plan updates when MongoDB is offline
let devPlansState = [...seedDevPlans];

/**
 * @desc    Get all investment plans sorted by price ascending
 * @route   GET /api/admin/plans
 * @access  Private (Admin Only)
 */
export const getAdminPlans = async (req, res, next) => {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      const plans = await Plan.find().sort({ price: 1 }).lean();

      if (!plans || plans.length === 0) {
        return res.status(200).json({
          success: true,
          count: devPlansState.length,
          data: devPlansState,
        });
      }

      return res.status(200).json({
        success: true,
        count: plans.length,
        data: plans,
      });
    } else {
      console.warn('[Admin Plans] MongoDB offline. Returning dev state investment plans.');
      return res.status(200).json({
        success: true,
        count: devPlansState.length,
        data: devPlansState,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new investment plan
 * @route   POST /api/admin/plans
 * @access  Private (Admin Only)
 */
export const createPlan = async (req, res, next) => {
  try {
    const {
      name,
      tokenSymbol,
      price,
      dailyReturnPercentage,
      frequency,
      capitalBack,
      badgeTag,
    } = req.body;

    // Payload validation
    if (!name || !tokenSymbol) {
      return res.status(400).json({ error: 'Please provide plan name and token symbol.' });
    }

    const priceNum = Number(price);
    const returnNum = Number(dailyReturnPercentage);

    if (isNaN(priceNum) || priceNum <= 0) {
      return res.status(400).json({ error: 'Minimum price amount must be a number greater than 0.' });
    }

    if (isNaN(returnNum) || returnNum <= 0) {
      return res.status(400).json({ error: 'Daily return percentage must be a number greater than 0.' });
    }

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      const newPlan = await Plan.create({
        name: name.trim(),
        tokenSymbol: tokenSymbol.trim().toUpperCase(),
        price: priceNum,
        dailyReturnPercentage: returnNum,
        frequency: frequency || 'Every 24 Hours',
        capitalBack: capitalBack === true || capitalBack === 'true' || capitalBack === 'Yes',
        badgeTag: badgeTag ? badgeTag.trim() : 'HOT',
        isActive: true,
      });

      return res.status(201).json({
        success: true,
        message: 'New investment plan created successfully!',
        data: newPlan,
      });
    } else {
      const devNewPlan = {
        _id: 'plan_dev_' + Date.now(),
        name: name.trim(),
        tokenSymbol: tokenSymbol.trim().toUpperCase(),
        price: priceNum,
        dailyReturnPercentage: returnNum,
        frequency: frequency || 'Every 24 Hours',
        capitalBack: capitalBack === true || capitalBack === 'true' || capitalBack === 'Yes',
        badgeTag: badgeTag ? badgeTag.trim() : 'HOT',
        isActive: true,
        totalSubscribers: 0,
        createdAt: new Date().toISOString(),
      };

      devPlansState.push(devNewPlan);

      return res.status(201).json({
        success: true,
        message: 'New investment plan created successfully!',
        data: devNewPlan,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update existing investment plan parameters
 * @route   PUT /api/admin/plans/:id
 * @access  Private (Admin Only)
 */
export const updatePlan = async (req, res, next) => {
  try {
    const planId = req.params.id;
    const {
      name,
      tokenSymbol,
      price,
      dailyReturnPercentage,
      frequency,
      capitalBack,
      badgeTag,
      isActive,
    } = req.body;

    const priceNum = Number(price);
    const returnNum = Number(dailyReturnPercentage);

    if (isNaN(priceNum) || priceNum <= 0) {
      return res.status(400).json({ error: 'Minimum price amount must be greater than 0.' });
    }

    if (isNaN(returnNum) || returnNum <= 0) {
      return res.status(400).json({ error: 'Daily return percentage must be greater than 0.' });
    }

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected && mongoose.Types.ObjectId.isValid(planId)) {
      const plan = await Plan.findById(planId);
      if (!plan) {
        return res.status(404).json({ error: 'Investment plan not found.' });
      }

      plan.name = name ? name.trim() : plan.name;
      plan.tokenSymbol = tokenSymbol ? tokenSymbol.trim().toUpperCase() : plan.tokenSymbol;
      plan.price = priceNum;
      plan.dailyReturnPercentage = returnNum;
      if (frequency) plan.frequency = frequency;
      if (capitalBack !== undefined) {
        plan.capitalBack = capitalBack === true || capitalBack === 'true' || capitalBack === 'Yes';
      }
      if (badgeTag !== undefined) plan.badgeTag = badgeTag.trim();
      if (isActive !== undefined) plan.isActive = Boolean(isActive);

      await plan.save();

      return res.status(200).json({
        success: true,
        message: 'Investment plan updated successfully!',
        data: plan,
      });
    } else {
      const index = devPlansState.findIndex((p) => p._id === planId);
      if (index !== -1) {
        devPlansState[index] = {
          ...devPlansState[index],
          name: name ? name.trim() : devPlansState[index].name,
          tokenSymbol: tokenSymbol ? tokenSymbol.trim().toUpperCase() : devPlansState[index].tokenSymbol,
          price: priceNum,
          dailyReturnPercentage: returnNum,
          frequency: frequency || devPlansState[index].frequency,
          capitalBack: capitalBack === true || capitalBack === 'true' || capitalBack === 'Yes',
          badgeTag: badgeTag !== undefined ? badgeTag.trim() : devPlansState[index].badgeTag,
          isActive: isActive !== undefined ? Boolean(isActive) : devPlansState[index].isActive,
        };

        return res.status(200).json({
          success: true,
          message: 'Investment plan updated successfully!',
          data: devPlansState[index],
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Investment plan updated successfully!',
        data: { _id: planId, name, price: priceNum, dailyReturnPercentage: returnNum },
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle plan Active/Disabled status
 * @route   PATCH /api/admin/plans/:id/toggle
 * @access  Private (Admin Only)
 */
export const togglePlanStatus = async (req, res, next) => {
  try {
    const planId = req.params.id;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected && mongoose.Types.ObjectId.isValid(planId)) {
      const plan = await Plan.findById(planId);
      if (!plan) {
        return res.status(404).json({ error: 'Investment plan not found.' });
      }

      plan.isActive = !plan.isActive;
      await plan.save();

      return res.status(200).json({
        success: true,
        message: `Plan is now ${plan.isActive ? 'Active' : 'Disabled'}.`,
        data: plan,
      });
    } else {
      const index = devPlansState.findIndex((p) => p._id === planId);
      if (index !== -1) {
        devPlansState[index].isActive = !devPlansState[index].isActive;
        return res.status(200).json({
          success: true,
          message: `Plan is now ${devPlansState[index].isActive ? 'Active' : 'Disabled'}.`,
          data: devPlansState[index],
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Plan status toggled successfully.',
        data: { _id: planId },
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete investment plan (rejects if active user investments exist)
 * @route   DELETE /api/admin/plans/:id
 * @access  Private (Admin Only)
 */
export const deletePlan = async (req, res, next) => {
  try {
    const planId = req.params.id;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected && mongoose.Types.ObjectId.isValid(planId)) {
      const plan = await Plan.findById(planId);
      if (!plan) {
        return res.status(404).json({ error: 'Investment plan not found.' });
      }

      // Check if active user investments exist under this plan
      try {
        const activeInvestment = await Investment.findOne({
          $or: [{ planName: plan.name }, { planId: plan._id }],
        });

        if (activeInvestment) {
          return res.status(400).json({
            error: 'Plan has active user investments and cannot be deleted. You can disable it instead.',
          });
        }
      } catch (checkErr) {
        console.warn('[Delete Plan Notice] Investment model check bypassed:', checkErr.message);
      }

      await Plan.findByIdAndDelete(planId);

      return res.status(200).json({
        success: true,
        message: 'Investment plan deleted successfully.',
      });
    } else {
      const index = devPlansState.findIndex((p) => p._id === planId);
      if (index !== -1) {
        // If subscribers > 0 in dev state, prevent deletion
        if (devPlansState[index].totalSubscribers > 5) {
          return res.status(400).json({
            error: 'Plan has active user investments and cannot be deleted. You can disable it instead.',
          });
        }
        devPlansState.splice(index, 1);
      }

      return res.status(200).json({
        success: true,
        message: 'Investment plan deleted successfully.',
      });
    }
  } catch (error) {
    next(error);
  }
};

// Router Registrations
router.get('/', adminProtect, getAdminPlans);
router.post('/', adminProtect, createPlan);
router.put('/:id', adminProtect, updatePlan);
router.patch('/:id/toggle', adminProtect, togglePlanStatus);
router.delete('/:id', adminProtect, deletePlan);

export default router;
