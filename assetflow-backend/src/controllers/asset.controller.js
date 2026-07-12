const Asset = require('../models/Asset.model');
const Allocation = require('../models/Allocation.model');
const { ApiResponse, ApiError } = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const paginate = require('../utils/paginate');
const logActivity = require('../utils/activityLogger');

const getAssets = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.status) query.status = req.query.status;
  if (req.query.category) query.category = req.query.category;
  if (req.query.department) query.department = req.query.department;
  const result = await paginate(Asset, query, { page: req.query.page, limit: req.query.limit, populate: [{ path: 'category', select: 'name' }, { path: 'department', select: 'name code' }] });
  res.json(new ApiResponse(200, result));
});

const getAssetById = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id).populate('category', 'name depreciationRate').populate('department', 'name code').populate('assignedTo');
  if (!asset) throw new ApiError(404, 'Asset not found');
  res.json(new ApiResponse(200, asset));
});

const createAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.create(req.body);
  await logActivity({ actor: req.user._id, action: 'Created asset', module: 'asset', targetId: asset._id });
  res.status(201).json(new ApiResponse(201, asset, 'Asset created'));
});

const updateAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!asset) throw new ApiError(404, 'Asset not found');
  await logActivity({ actor: req.user._id, action: 'Updated asset', module: 'asset', targetId: asset._id });
  res.json(new ApiResponse(200, asset, 'Asset updated'));
});

const deleteAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findByIdAndDelete(req.params.id);
  if (!asset) throw new ApiError(404, 'Asset not found');
  await logActivity({ actor: req.user._id, action: 'Deleted asset', module: 'asset', targetId: asset._id });
  res.json(new ApiResponse(200, null, 'Asset deleted'));
});

const searchAssets = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) throw new ApiError(400, 'Search query is required');
  const assets = await Asset.find({ $text: { $search: q } }, { score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } }).limit(20).populate('category', 'name').populate('department', 'name');
  res.json(new ApiResponse(200, assets));
});

const getAssetHistory = asyncHandler(async (req, res) => {
  const allocations = await Allocation.find({ asset: req.params.id }).sort({ createdAt: -1 }).populate('employee').populate('allocatedBy', 'name');
  res.json(new ApiResponse(200, allocations));
});

const getAssetByQr = asyncHandler(async (req, res) => {
  const asset = await Asset.findOne({ assetTag: req.params.assetTag }).populate('category', 'name').populate('department', 'name');
  if (!asset) throw new ApiError(404, 'Asset not found');
  res.json(new ApiResponse(200, asset));
});

module.exports = { getAssets, getAssetById, createAsset, updateAsset, deleteAsset, searchAssets, getAssetHistory, getAssetByQr };
