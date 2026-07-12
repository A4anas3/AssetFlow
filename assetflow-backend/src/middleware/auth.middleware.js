const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User.model');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) throw new ApiError(401, 'Not authorized, no token');

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id).select('-password -refreshToken');

  if (!req.user) throw new ApiError(401, 'User not found');

  next();
});

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, `Role '${req.user.role}' is not authorized`));
  }
  next();
};

module.exports = { protect, authorize };
