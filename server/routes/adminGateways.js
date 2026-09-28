import express from 'express';
import mongoose from 'mongoose';
import Gateway from '../models/Gateway.js';
import Deposit from '../models/Deposit.js';
import { adminProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Default seed dev gateways if DB is empty or offline
const seedDevGateways = [
  {
    _id: 'gate_usdt_bep20_01',
    name: 'USDT BEP20',
    currency: 'USDT',
    network: 'BNB Smart Chain BEP20',
    walletAddress: '0x86A04560103588BFA89B478E09F6d89C0C858eEB',
    videoGuideUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    minAmount: 20.0,
    maxAmount: 10000.0,
    fixedCharge: 0.0,
    percentCharge: 0.0,
    instruction: 'Send exact USDT BEP20 amount to this wallet address. Upload payment screenshot for verification.',
    isActive: true,
    createdAt: new Date('2026-07-01T10:00:00Z').toISOString(),
  },
  {
    _id: 'gate_usdt_trc20_02',
    name: 'USDT TRC20',
    currency: 'USDT',
    network: 'TRON Network TRC20',
    walletAddress: 'TYD92hKn81gH7sKqL93kJsLq87sKa',
    videoGuideUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    minAmount: 50.0,
    maxAmount: 50000.0,
    fixedCharge: 1.0,
    percentCharge: 0.5,
    instruction: 'Send exact USDT TRC20 amount to this TRON address. Note: TRC20 transactions settle within 3-5 minutes.',
    isActive: true,
    createdAt: new Date('2026-07-05T10:00:00Z').toISOString(),
  },
  {
    _id: 'gate_btc_03',
    name: 'Bitcoin BTC',
    currency: 'BTC',
    network: 'Bitcoin Mainnet',
    walletAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    videoGuideUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    minAmount: 100.0,
    maxAmount: 100000.0,
    fixedCharge: 0.0,
    percentCharge: 1.0,
    instruction: 'Send Bitcoin to this address. Requires 2 network confirmations before approval.',
    isActive: true,
    createdAt: new Date('2026-07-10T10:00:00Z').toISOString(),
  },
];

// In-memory dev storage state for gateway updates when MongoDB is offline
let devGatewaysState = [...seedDevGateways];

/**
 * @desc    Get all manual payment gateways
 * @route   GET /api/admin/gateways
 * @access  Private (Admin Only)
 */
export const getAdminGateways = async (req, res, next) => {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      const gateways = await Gateway.find().sort({ createdAt: -1 }).lean();

      if (!gateways || gateways.length === 0) {
        return res.status(200).json({
          success: true,
          count: devGatewaysState.length,
          data: devGatewaysState,
        });
      }

      return res.status(200).json({
        success: true,
        count: gateways.length,
        data: gateways,
      });
    } else {
      console.warn('[Admin Gateways] MongoDB offline. Returning dev state gateway records.');
      return res.status(200).json({
        success: true,
        count: devGatewaysState.length,
        data: devGatewaysState,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new manual payment gateway
 * @route   POST /api/admin/gateways
 * @access  Private (Admin Only)
 */
export const createGateway = async (req, res, next) => {
  try {
    const {
      name,
      currency,
      network,
      walletAddress,
      videoGuideUrl,
      minAmount,
      maxAmount,
      fixedCharge,
      percentCharge,
      instruction,
    } = req.body;

    if (!name || !walletAddress) {
      return res.status(400).json({ error: 'Please provide gateway name and receiving wallet address.' });
    }

    const min = Number(minAmount) || 10;
    const max = Number(maxAmount) || 10000;
    const fixed = Number(fixedCharge) || 0;
    const percent = Number(percentCharge) || 0;

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      const newGateway = await Gateway.create({
        name: name.trim(),
        currency: currency ? currency.trim().toUpperCase() : 'USDT',
        network: network ? network.trim() : 'BEP20',
        walletAddress: walletAddress.trim(),
        videoGuideUrl: videoGuideUrl ? videoGuideUrl.trim() : '',
        minAmount: min,
        maxAmount: max,
        fixedCharge: fixed,
        percentCharge: percent,
        instruction: instruction ? instruction.trim() : 'Send exact amount to this wallet address.',
        isActive: true,
      });

      return res.status(201).json({
        success: true,
        message: 'New manual payment gateway configured successfully!',
        data: newGateway,
      });
    } else {
      const devNewGateway = {
        _id: 'gate_dev_' + Date.now(),
        name: name.trim(),
        currency: currency ? currency.trim().toUpperCase() : 'USDT',
        network: network ? network.trim() : 'BEP20',
        walletAddress: walletAddress.trim(),
        videoGuideUrl: videoGuideUrl ? videoGuideUrl.trim() : '',
        minAmount: min,
        maxAmount: max,
        fixedCharge: fixed,
        percentCharge: percent,
        instruction: instruction ? instruction.trim() : 'Send exact amount to this wallet address.',
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      devGatewaysState.push(devNewGateway);

      return res.status(201).json({
        success: true,
        message: 'New manual payment gateway configured successfully!',
        data: devNewGateway,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update existing payment gateway parameters
 * @route   PUT /api/admin/gateways/:id
 * @access  Private (Admin Only)
 */
export const updateGateway = async (req, res, next) => {
  try {
    const gatewayId = req.params.id;
    const {
      name,
      currency,
      network,
      walletAddress,
      videoGuideUrl,
      minAmount,
      maxAmount,
      fixedCharge,
      percentCharge,
      instruction,
      isActive,
    } = req.body;

    if (!name || !walletAddress) {
      return res.status(400).json({ error: 'Gateway name and wallet address cannot be empty.' });
    }

    const min = Number(minAmount) || 10;
    const max = Number(maxAmount) || 10000;
    const fixed = Number(fixedCharge) || 0;
    const percent = Number(percentCharge) || 0;

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected && mongoose.Types.ObjectId.isValid(gatewayId)) {
      const gateway = await Gateway.findById(gatewayId);
      if (!gateway) {
        return res.status(404).json({ error: 'Gateway configuration record not found.' });
      }

      gateway.name = name.trim();
      gateway.currency = currency ? currency.trim().toUpperCase() : gateway.currency;
      gateway.network = network ? network.trim() : gateway.network;
      gateway.walletAddress = walletAddress.trim();
      if (videoGuideUrl !== undefined) gateway.videoGuideUrl = videoGuideUrl.trim();
      gateway.minAmount = min;
      gateway.maxAmount = max;
      gateway.fixedCharge = fixed;
      gateway.percentCharge = percent;
      if (instruction !== undefined) gateway.instruction = instruction.trim();
      if (isActive !== undefined) gateway.isActive = Boolean(isActive);

      await gateway.save();

      return res.status(200).json({
        success: true,
        message: 'Payment gateway configuration updated successfully!',
        data: gateway,
      });
    } else {
      const index = devGatewaysState.findIndex((g) => g._id === gatewayId);
      if (index !== -1) {
        devGatewaysState[index] = {
          ...devGatewaysState[index],
          name: name.trim(),
          currency: currency ? currency.trim().toUpperCase() : devGatewaysState[index].currency,
          network: network ? network.trim() : devGatewaysState[index].network,
          walletAddress: walletAddress.trim(),
          videoGuideUrl: videoGuideUrl !== undefined ? videoGuideUrl.trim() : devGatewaysState[index].videoGuideUrl,
          minAmount: min,
          maxAmount: max,
          fixedCharge: fixed,
          percentCharge: percent,
          instruction: instruction !== undefined ? instruction.trim() : devGatewaysState[index].instruction,
          isActive: isActive !== undefined ? Boolean(isActive) : devGatewaysState[index].isActive,
        };

        return res.status(200).json({
          success: true,
          message: 'Payment gateway configuration updated successfully!',
          data: devGatewaysState[index],
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Payment gateway configuration updated successfully!',
        data: { _id: gatewayId, name, walletAddress },
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle gateway Active/Disabled status
 * @route   PATCH /api/admin/gateways/:id/toggle
 * @access  Private (Admin Only)
 */
export const toggleGatewayStatus = async (req, res, next) => {
  try {
    const gatewayId = req.params.id;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected && mongoose.Types.ObjectId.isValid(gatewayId)) {
      const gateway = await Gateway.findById(gatewayId);
      if (!gateway) {
        return res.status(404).json({ error: 'Gateway record not found.' });
      }

      gateway.isActive = !gateway.isActive;
      await gateway.save();

      return res.status(200).json({
        success: true,
        message: `Gateway is now ${gateway.isActive ? 'Active' : 'Disabled'}.`,
        data: gateway,
      });
    } else {
      const index = devGatewaysState.findIndex((g) => g._id === gatewayId);
      if (index !== -1) {
        devGatewaysState[index].isActive = !devGatewaysState[index].isActive;
        return res.status(200).json({
          success: true,
          message: `Gateway is now ${devGatewaysState[index].isActive ? 'Active' : 'Disabled'}.`,
          data: devGatewaysState[index],
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Gateway status updated.',
        data: { _id: gatewayId },
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete payment gateway (verifies no pending deposits exist)
 * @route   DELETE /api/admin/gateways/:id
 * @access  Private (Admin Only)
 */
export const deleteGateway = async (req, res, next) => {
  try {
    const gatewayId = req.params.id;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected && mongoose.Types.ObjectId.isValid(gatewayId)) {
      const gateway = await Gateway.findById(gatewayId);
      if (!gateway) {
        return res.status(404).json({ error: 'Gateway record not found.' });
      }

      // Check if any pending deposit requests exist for this gateway
      try {
        const pendingDeposit = await Deposit.findOne({
          gatewayType: new RegExp(gateway.name, 'i'),
          status: 'Pending',
        });

        if (pendingDeposit) {
          return res.status(400).json({
            error: 'Cannot delete gateway while pending user deposit requests exist for it. You can disable it instead.',
          });
        }
      } catch (checkErr) {
        console.warn('[Delete Gateway Notice] Deposit check bypassed:', checkErr.message);
      }

      await Gateway.findByIdAndDelete(gatewayId);

      return res.status(200).json({
        success: true,
        message: 'Payment gateway deleted successfully.',
      });
    } else {
      const index = devGatewaysState.findIndex((g) => g._id === gatewayId);
      if (index !== -1) {
        devGatewaysState.splice(index, 1);
      }

      return res.status(200).json({
        success: true,
        message: 'Payment gateway deleted successfully.',
      });
    }
  } catch (error) {
    next(error);
  }
};

// Router Registrations
router.get('/', adminProtect, getAdminGateways);
router.post('/', adminProtect, createGateway);
router.put('/:id', adminProtect, updateGateway);
router.patch('/:id/toggle', adminProtect, toggleGatewayStatus);
router.delete('/:id', adminProtect, deleteGateway);

export default router;
