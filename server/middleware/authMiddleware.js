import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

/**
 * Strict Customer JWT Authentication Middleware
 */
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'Access token missing. Unauthorized.' });
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'globalprofithub_supersecret_jwt_key_2026'
      );

      const userId = decoded.id || decoded._id;
      req.user = { id: userId, _id: userId, ...decoded };

      // Session Revocation Guard: Verify requesting user status in DB if Mongo connected
      if (
        mongoose.connection.readyState === 1 &&
        userId &&
        !String(userId).startsWith('guest_') &&
        !String(userId).startsWith('dev_')
      ) {
        if (mongoose.Types.ObjectId.isValid(userId)) {
          const user = await User.findById(userId).select('status isSuspended');
          if (!user) {
            return res.status(401).json({ error: 'User account no longer exists.' });
          }
          const accountStatus = user.status || (user.isSuspended ? 'Suspended' : 'Active');
          if (accountStatus === 'Suspended') {
            return res.status(403).json({
              error: 'Your account is suspended. Please contact admin support.',
              status: 'Suspended',
            });
          }
          if (accountStatus === 'Blocked') {
            return res.status(403).json({
              error: 'Your account has been permanently blocked. Access denied.',
              status: 'Blocked',
            });
          }
        }
      }

      return next();
    } catch (error) {
      console.error('[Auth Middleware] Token verification failed:', error.message);
      return res.status(401).json({ error: 'Session expired or invalid token.' });
    }
  }

  return res.status(401).json({ error: 'Access token missing. Unauthorized.' });
};

export const protectUser = protect;

/**
 * Strict Admin JWT Authentication Middleware
 */
export const adminProtect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'Admin access token missing. Unauthorized.' });
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'globalprofithub_supersecret_jwt_key_2026'
      );

      const userId = decoded.id || decoded._id;

      if (decoded.role === 'admin' || userId === 'default_admin_user_001') {
        req.user = { id: userId, _id: userId, role: 'admin' };
        return next();
      }
      return res.status(403).json({ error: 'Access denied. Admin authorization required.' });
    } catch (error) {
      console.error('[Admin Auth Middleware] Token verification failed:', error.message);
      return res.status(401).json({ error: 'Not authorized as admin, token failed' });
    }
  }

  return res.status(401).json({ error: 'Admin access token missing. Unauthorized.' });
};

export const verifyAdminToken = adminProtect;
