const Booking = require('../models/Booking.model');
const Asset = require('../models/Asset.model');
const Notification = require('../models/Notification.model');
const { ApiResponse, ApiError } = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const paginate = require('../utils/paginate');
const logActivity = require('../utils/activityLogger');
const { BOOKING_STATUS } = require('../config/constants');

const getBookings = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.status) query.status = req.query.status;
  if (req.query.resource) query.resource = req.query.resource;
  const result = await paginate(Booking, query, {
    page: req.query.page,
    limit: req.query.limit,
    populate: [
      { path: 'resource', select: 'name assetTag' },
      { path: 'bookedBy', select: 'name email' },
    ],
  });
  res.json(new ApiResponse(200, result));
});

const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('resource')
    .populate('bookedBy', 'name email');
  if (!booking) throw new ApiError(404, 'Booking not found');
  res.json(new ApiResponse(200, booking));
});

const createBooking = asyncHandler(async (req, res) => {
  const { resource, startTime, endTime } = req.body;
  const asset = await Asset.findById(resource);
  if (!asset) throw new ApiError(404, 'Resource not found');
  if (!asset.isBookable) throw new ApiError(400, 'This asset is not bookable');

  // Overlap check: reject if another UPCOMING or ONGOING booking overlaps
  const conflict = await Booking.findOne({
    resource,
    status: { $in: [BOOKING_STATUS.UPCOMING, BOOKING_STATUS.ONGOING] },
    $or: [{ startTime: { $lt: new Date(endTime) }, endTime: { $gt: new Date(startTime) } }],
  });
  if (conflict) throw new ApiError(409, 'Resource is already booked for this time slot');

  const booking = await Booking.create({ ...req.body, bookedBy: req.user._id });

  // Spec: notify user — Booking Confirmed
  await Notification.create({
    recipient: req.user._id,
    type: 'booking',
    title: 'Booking Confirmed',
    message: `Your booking for "${asset.name}" from ${new Date(startTime).toLocaleString()} has been confirmed`,
    linkedModule: 'booking',
    linkedId: booking._id,
  });

  await logActivity({
    actor: req.user._id,
    action: 'Created booking',
    module: 'booking',
    targetId: booking._id,
  });
  res.status(201).json(new ApiResponse(201, booking, 'Booking confirmed'));
});

const updateBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found');

  // Only the owner or admin can update
  const isOwner = booking.bookedBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) throw new ApiError(403, 'Not authorized to update this booking');

  const updated = await Booking.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.json(new ApiResponse(200, updated, 'Booking updated'));
});

const deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findByIdAndDelete(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found');
  res.json(new ApiResponse(200, null, 'Booking deleted'));
});

const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (booking.status !== BOOKING_STATUS.UPCOMING)
    throw new ApiError(400, 'Only upcoming bookings can be cancelled');

  // Ownership check
  const isOwner = booking.bookedBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) throw new ApiError(403, 'Not authorized to cancel this booking');

  booking.status = BOOKING_STATUS.CANCELLED;
  booking.cancelledAt = new Date();
  booking.cancelReason = req.body.reason || '';
  await booking.save();

  // Spec: Booking Cancelled notification
  await Notification.create({
    recipient: booking.bookedBy,
    type: 'booking',
    title: 'Booking Cancelled',
    message: req.body.reason || 'Your booking has been cancelled',
    linkedModule: 'booking',
    linkedId: booking._id,
  });

  res.json(new ApiResponse(200, booking, 'Booking cancelled'));
});

const rescheduleBooking = asyncHandler(async (req, res) => {
  const { startTime, endTime } = req.body;
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found');

  const isOwner = booking.bookedBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) throw new ApiError(403, 'Not authorized to reschedule this booking');

  // Overlap check excluding current booking
  const conflict = await Booking.findOne({
    resource: booking.resource,
    status: { $in: [BOOKING_STATUS.UPCOMING, BOOKING_STATUS.ONGOING] },
    _id: { $ne: booking._id },
    $or: [{ startTime: { $lt: new Date(endTime) }, endTime: { $gt: new Date(startTime) } }],
  });
  if (conflict) throw new ApiError(409, 'Resource is already booked for this time slot');

  booking.startTime = startTime;
  booking.endTime = endTime;
  booking.rescheduledAt = new Date();
  await booking.save();
  res.json(new ApiResponse(200, booking, 'Booking rescheduled'));
});

const getCalendar = asyncHandler(async (req, res) => {
  const { start, end } = req.query;
  const query = { status: { $in: [BOOKING_STATUS.UPCOMING, BOOKING_STATUS.ONGOING] } };
  if (start && end) query.startTime = { $gte: new Date(start), $lte: new Date(end) };
  const bookings = await Booking.find(query)
    .populate('resource', 'name assetTag')
    .populate('bookedBy', 'name');
  res.json(new ApiResponse(200, bookings));
});

const getBookingsByResource = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ resource: req.params.id })
    .sort({ startTime: -1 })
    .populate('bookedBy', 'name email');
  res.json(new ApiResponse(200, bookings));
});

module.exports = {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
  cancelBooking,
  rescheduleBooking,
  getCalendar,
  getBookingsByResource,
};
