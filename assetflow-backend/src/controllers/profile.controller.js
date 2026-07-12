const User = require('../models/User.model');
const { ApiResponse, ApiError } = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const logActivity = require('../utils/activityLogger');

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password -refreshToken').populate('department', 'name code');
  res.json(new ApiResponse(200, user));
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { name, email }, { new: true, runValidators: true }).select('-password -refreshToken');
  await logActivity({ actor: req.user._id, action: 'Updated profile', module: 'profile', targetId: req.user._id });
  res.json(new ApiResponse(200, user, 'Profile updated'));
});

const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const valid = await user.comparePassword(req.body.currentPassword);
  if (!valid) throw new ApiError(401, 'Current password is incorrect');
  user.password = req.body.newPassword;
  await user.save();
  res.json(new ApiResponse(200, null, 'Password changed'));
});

const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');
  const avatarPath = `/uploads/avatars/${req.file.filename}`;
  const user = await User.findByIdAndUpdate(req.user._id, { avatar: avatarPath }, { new: true }).select('-password -refreshToken');
  res.json(new ApiResponse(200, user, 'Avatar updated'));
});

module.exports = { getProfile, updateProfile, changePassword, updateAvatar };
