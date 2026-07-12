const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { ApiResponse, ApiError } = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const logActivity = require('../utils/activityLogger');
const { ROLES } = require('../config/constants');

const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'Email already registered');
  const user = await User.create({ name, email, password, role: ROLES.EMPLOYEE });
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save();
  await logActivity({ actor: user._id, action: 'User signed up', module: 'auth', targetId: user._id });
  res.status(201).json(new ApiResponse(201, { accessToken, refreshToken, user: { _id: user._id, name: user.name, email: user.email, role: user.role } }, 'User registered successfully'));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) throw new ApiError(401, 'Invalid credentials');
  if (!user.isActive) throw new ApiError(403, 'Account is deactivated');
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save();
  await logActivity({ actor: user._id, action: 'User logged in', module: 'auth', targetId: user._id });
  res.json(new ApiResponse(200, { accessToken, refreshToken, user: { _id: user._id, name: user.name, email: user.email, role: user.role } }, 'Login successful'));
});

const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { refreshToken: '' });
  res.clearCookie('accessToken');
  res.json(new ApiResponse(200, null, 'Logged out successfully'));
});

const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) throw new ApiError(404, 'No user with that email');
  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
  await user.save();
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  await sendEmail({ to: user.email, subject: 'AssetFlow Password Reset', html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Expires in 10 minutes.</p>` });
  res.json(new ApiResponse(200, null, 'Reset email sent'));
});

const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.body.token).digest('hex');
  const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpires: { $gt: Date.now() } });
  if (!user) throw new ApiError(400, 'Invalid or expired token');
  user.password = req.body.password;
  user.resetPasswordToken = '';
  user.resetPasswordExpires = undefined;
  await user.save();
  res.json(new ApiResponse(200, null, 'Password reset successful'));
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password -refreshToken').populate('department', 'name code');
  res.json(new ApiResponse(200, user));
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  if (!token) throw new ApiError(401, 'Refresh token required');
  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== token) throw new ApiError(401, 'Invalid refresh token');
  const accessToken = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);
  user.refreshToken = newRefreshToken;
  await user.save();
  res.json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }));
});

module.exports = { signup, login, logout, forgotPassword, resetPassword, getMe, refreshToken };
