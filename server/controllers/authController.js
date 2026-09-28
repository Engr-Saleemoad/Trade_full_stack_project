import User from '../models/User.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Seed default test user into MongoDB if not existing
export const seedDefaultTestUser = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      const existing = await User.findOne({ username: 'john' });
      if (!existing) {
        await User.create({
          firstName: 'John',
          lastName: 'Doe',
          username: 'john',
          email: 'john@example.com',
          country: 'Afghanistan (+93)',
          phone: '1234567890',
          password: 'ABCabc@123',
          role: 'customer',
          mainBalance: 1250.0,
          interestBalance: 320.0,
          totalDeposit: 1000.0,
          totalEarn: 450.0,
          totalInvest: 800.0,
          totalPayout: 200.0,
          totalReferralBonus: 50.0,
          totalTickets: 2,
        });
        console.log('✅ Default test user (john / ABCabc@123) seeded in MongoDB.');
      }
    }
  } catch (err) {
    console.warn('[Seed Warning] Could not seed default user:', err.message);
  }
};

// Helper function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'globalprofithub_supersecret_jwt_key_2026', {
    expiresIn: '30d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  try {
    const { firstName, lastName, username, email, country, phone, password } = req.body;

    if (!firstName || !lastName || !username || !email || !phone || !password) {
      return res.status(400).json({ error: 'Please fill in all required fields.' });
    }

    const emailLower = email.toLowerCase();
    const usernameLower = username.toLowerCase();

    const userExists = await User.findOne({
      $or: [{ email: emailLower }, { username: usernameLower }],
    });

    if (userExists) {
      if (userExists.email.toLowerCase() === emailLower) {
        return res.status(400).json({ error: 'An account with this email address already exists.' });
      }
      if (userExists.username.toLowerCase() === usernameLower) {
        return res.status(400).json({ error: 'This username is already taken.' });
      }
    }

    const user = await User.create({
      firstName,
      lastName,
      username: usernameLower,
      email: emailLower,
      country: country || 'Afghanistan (+93)',
      phone,
      password,
      mainBalance: 0.00,
      interestBalance: 0.00,
      totalDeposit: 0.00,
      totalEarn: 0.00,
      totalInvest: 0.00,
      totalPayout: 0.00,
      totalReferralBonus: 0.00,
      status: 'Active',
    });

    const token = generateToken(user._id);

    const userPayload = {
      id: user._id,
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      country: user.country,
      phone: user.phone,
      role: user.role,
      mainBalance: 0.00,
      interestBalance: 0.00,
      status: user.status || 'Active',
      createdAt: user.createdAt,
    };

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Redirecting to your dashboard...',
      token,
      user: userPayload,
      data: userPayload,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate member & get JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;

    const identifier = (email || username || '').trim().toLowerCase();

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Please provide email/username and password' });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return res.status(404).json({ error: 'User does not exist' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // User account status checks
    const accountStatus = user.status || (user.isSuspended ? 'Suspended' : 'Active');
    if (accountStatus === 'Suspended') {
      return res.status(403).json({ error: 'Your account is suspended. Please contact admin support.' });
    }
    if (accountStatus === 'Blocked') {
      return res.status(403).json({ error: 'Your account has been permanently blocked. Access denied.' });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
        id: user._id,
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role,
        mainBalance: user.mainBalance !== undefined ? user.mainBalance : 0.00,
        interestBalance: user.interestBalance !== undefined ? user.interestBalance : 0.00,
        status: accountStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot Password - request password reset link
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const targetEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: targetEmail });
    if (!user) {
      return res.status(404).json({
        error: 'Submitted email does not match any registered investor account.',
      });
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    return res.status(200).json({
      success: true,
      message: 'A dynamic password recovery instruction link has been processed to your email account successfully!',
      resetToken,
    });
  } catch (error) {
    next(error);
  }
};

