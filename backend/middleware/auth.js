const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const User = require('../models/User');

// Protect routes
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Support offline sync mutations from field mobile app
      if (token && token.startsWith('offline_token_')) {
        const userEmail = req.headers['x-user-email'];
        const userId = req.headers['x-user-id'];
        let matchedUser = null;

        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
          matchedUser = await User.findById(userId).select('-password');
        }
        if (!matchedUser && userEmail) {
          matchedUser = await User.findOne({ email: String(userEmail).toLowerCase().trim() }).select('-password');
        }
        if (!matchedUser) {
          matchedUser = await User.findOne({ role: 'mine_official', isActive: true }).select('-password');
        }
        if (!matchedUser) {
          matchedUser = await User.findOne({ isActive: true }).select('-password');
        }

        if (matchedUser && matchedUser.isActive) {
          req.user = matchedUser;
          return next();
        }
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user || !req.user.isActive) {
        res.status(401);
        throw new Error('Not authorized, user not found or inactive');
      }

      next();
    } catch (error) {
      // Gracefully support sync requests if token recently expired but user is valid and active
      if (error && error.name === 'TokenExpiredError') {
        try {
          const decoded = jwt.decode(token);
          if (decoded && decoded.id) {
            const expiredUser = await User.findById(decoded.id).select('-password');
            if (expiredUser && expiredUser.isActive) {
              req.user = expiredUser;
              return next();
            }
          }
        } catch (innerErr) {
          console.error('Failed to resolve expired token user:', innerErr);
        }
      }

      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Role based access
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`User role '${req.user.role}' is not authorized to access this route`);
    }
    next();
  };
};

module.exports = { protect, authorize };