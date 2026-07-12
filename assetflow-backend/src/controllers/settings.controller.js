const Settings = require('../models/Settings.model');
const { ApiResponse } = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const logActivity = require('../utils/activityLogger');

const getSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.find();
  const result = settings.reduce((acc, s) => { acc[s.key] = s.value; return acc; }, {});
  res.json(new ApiResponse(200, result));
});

const updateSettings = asyncHandler(async (req, res) => {
  const updates = req.body;
  const ops = Object.entries(updates).map(([key, value]) =>
    Settings.findOneAndUpdate({ key }, { key, value }, { upsert: true, new: true })
  );
  await Promise.all(ops);
  await logActivity({ actor: req.user._id, action: 'Updated settings', module: 'settings', targetId: null });
  res.json(new ApiResponse(200, null, 'Settings updated'));
});

module.exports = { getSettings, updateSettings };
