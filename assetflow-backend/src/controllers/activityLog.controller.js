const ActivityLog = require('../models/ActivityLog.model');
const { ApiResponse, ApiError } = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const paginate = require('../utils/paginate');

const getActivityLogs = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.module) query.module = req.query.module;
  if (req.query.actor) query.actor = req.query.actor;
  const result = await paginate(ActivityLog, query, { page: req.query.page, limit: req.query.limit, populate: { path: 'actor', select: 'name email role' } });
  res.json(new ApiResponse(200, result));
});

const getActivityLogById = asyncHandler(async (req, res) => {
  const log = await ActivityLog.findById(req.params.id).populate('actor', 'name email role');
  if (!log) throw new ApiError(404, 'Activity log not found');
  res.json(new ApiResponse(200, log));
});

module.exports = { getActivityLogs, getActivityLogById };
