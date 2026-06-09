// src/middleware/auth.js
// JWT authentication and role-based authorization middleware

import jwt from 'jsonwebtoken';
import User from '../features/admin/admin.model.js';

/**
 * Middleware: Protect routes — verifies JWT token in Authorization header
 */
export const protect = async (req, res, next) => {
  try {
    // Extract token from Bearer header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: req.t('TOKEN_REQUIRED'),
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request (exclude password)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: req.t('TOKEN_INVALID'),
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: req.t('TOKEN_INVALID'),
    });
  }
};

/**
 * Middleware: Role-based access control
 * Usage: authorize('admin', 'superadmin')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: req.t('FORBIDDEN'),
      });
    }
    next();
  };
};
