import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import SubAdmin from '../models/SubAdmin.js';
import mongoose from 'mongoose';

export const protectAdmin = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Not authorized, no admin token provided.' });
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'globalprofithub_supersecret_jwt_key_2026'
      );

      if (decoded.role !== 'admin' && decoded.role !== 'sub-admin') {
        return res.status(403).json({ error: 'Forbidden. Administrative privileges required.' });
      }

      if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(decoded.id)) {
        if (decoded.role === 'sub-admin') {
          req.admin = await SubAdmin.findById(decoded.id).select('-password');
          if (!req.admin) {
            req.admin = { id: decoded.id, role: 'sub-admin', permissions: decoded.permissions || {} };
          }
        } else {
          req.admin = await User.findById(decoded.id).select('-password');
          if (!req.admin) {
            req.admin = { id: decoded.id, username: 'admin', role: 'admin' };
          }
        }
      } else {
        req.admin = {
          id: decoded.id,
          username: decoded.username || 'admin',
          role: decoded.role || 'admin',
          permissions: decoded.permissions || {},
        };
      }

      next();
    } catch (err) {
      return res.status(401).json({ error: 'Token authorization failed: ' + err.message });
    }
  } catch (error) {
    next(error);
  }
};
