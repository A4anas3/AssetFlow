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
  // Spec: filter by location
  if (req.query.location) query.location = new RegExp(req.query.location, 'i');
  if (req.query.isBookable !== undefined) query.isBookable = req.query.isBookable === 'true';

  const result = await paginate(Asset, query, {
    page: req.query.page,
    limit: req.query.limit,
    populate: [
      { path: 'category', select: 'name depreciationRate' },
      { path: 'department', select: 'name code' },
      { path: 'assignedTo', populate: { path: 'user', select: 'name email' } },
    ],
  });
  res.json(new ApiResponse(200, result));
});

const getAssetById = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id)
    .populate('category', 'name depreciationRate customFields defaultWarrantyMonths')
    .populate('department', 'name code')
    .populate({ path: 'assignedTo', populate: { path: 'user', select: 'name email avatar' } });
  if (!asset) throw new ApiError(404, 'Asset not found');
  res.json(new ApiResponse(200, asset));
});

const createAsset = asyncHandler(async (req, res) => {
  // Spec: auto-generate Asset Tag like AF-0001 if not provided
  let { assetTag } = req.body;
  if (!assetTag) {
    const lastAsset = await Asset.findOne({}, { assetTag: 1 }).sort({ createdAt: -1 });
    let nextNum = 1;
    if (lastAsset?.assetTag) {
      const match = lastAsset.assetTag.match(/(\d+)$/);
      if (match) nextNum = parseInt(match[1], 10) + 1;
    }
    assetTag = `AF-${String(nextNum).padStart(4, '0')}`;
  }

  const asset = await Asset.create({ ...req.body, assetTag });
  await logActivity({ actor: req.user._id, action: 'Created asset', module: 'asset', targetId: asset._id });
  res.status(201).json(new ApiResponse(201, asset, 'Asset created'));
});

const updateAsset = asyncHandler(async (req, res) => {
  // Prevent assetTag from being changed after creation
  const { assetTag, ...updateData } = req.body;
  const asset = await Asset.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!asset) throw new ApiError(404, 'Asset not found');
  await logActivity({ actor: req.user._id, action: 'Updated asset', module: 'asset', targetId: asset._id });
  res.json(new ApiResponse(200, asset, 'Asset updated'));
});

const deleteAsset = asyncHandler(async (req, res) => {
  // Guard: cannot delete an asset that is actively allocated or in maintenance
  const activeAllocation = await Allocation.findOne({
    asset: req.params.id,
    status: { $in: ['active', 'return_requested'] },
  });
  if (activeAllocation) throw new ApiError(400, 'Cannot delete an asset that is currently allocated');

  const asset = await Asset.findByIdAndDelete(req.params.id);
  if (!asset) throw new ApiError(404, 'Asset not found');
  await logActivity({ actor: req.user._id, action: 'Deleted asset', module: 'asset', targetId: asset._id });
  res.json(new ApiResponse(200, null, 'Asset deleted'));
});

const searchAssets = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) throw new ApiError(400, 'Search query is required');
  const assets = await Asset.find(
    { $text: { $search: q } },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(20)
    .populate('category', 'name')
    .populate('department', 'name');
  res.json(new ApiResponse(200, assets));
});

// Spec: "per-asset history = allocation history + maintenance history"
const getAssetHistory = asyncHandler(async (req, res) => {
  const Maintenance = require('../models/Maintenance.model');
  const [allocations, maintenance] = await Promise.all([
    Allocation.find({ asset: req.params.id })
      .sort({ createdAt: -1 })
      .populate({ path: 'employee', populate: { path: 'user', select: 'name email' } })
      .populate('allocatedBy', 'name'),
    Maintenance.find({ asset: req.params.id })
      .sort({ createdAt: -1 })
      .populate('requestedBy', 'name email')
      .populate('assignedTo', 'name email'),
  ]);
  res.json(new ApiResponse(200, { allocations, maintenance }));
});

const getAssetByQr = asyncHandler(async (req, res) => {
  const asset = await Asset.findOne({ assetTag: req.params.assetTag })
    .populate('category', 'name customFields defaultWarrantyMonths')
    .populate('department', 'name')
    .populate({ path: 'assignedTo', populate: { path: 'user', select: 'name email' } });
  if (!asset) throw new ApiError(404, 'Asset not found');
  res.json(new ApiResponse(200, asset));
});

module.exports = {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  searchAssets,
  getAssetHistory,
  getAssetByQr,
};
