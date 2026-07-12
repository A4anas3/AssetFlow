const Notification = require('../models/Notification.model');
const { ApiResponse, ApiError } = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const paginate = require('../utils/paginate');

const getNotifications = asyncHandler(async (req, res) => {
  const result = await paginate(Notification, { recipient: req.user._id }, { page: req.query.page, limit: req.query.limit });
  res.json(new ApiResponse(200, result));
});

const markRead = asyncHandler(async (req, res) => {
  const n = await Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.user._id }, { isRead: true }, { new: true });
  if (!n) throw new ApiError(404, 'Notification not found');
  res.json(new ApiResponse(200, n, 'Marked as read'));
});

const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
  res.json(new ApiResponse(200, null, 'All notifications marked as read'));
});

const deleteNotification = asyncHandler(async (req, res) => {
  const n = await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
  if (!n) throw new ApiError(404, 'Notification not found');
  res.json(new ApiResponse(200, null, 'Notification deleted'));
});

module.exports = { getNotifications, markRead, markAllRead, deleteNotification };
