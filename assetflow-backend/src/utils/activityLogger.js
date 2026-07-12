const ActivityLog = require('../models/ActivityLog.model');

const logActivity = async ({ actor, action, module, targetId = null, meta = {} }) => {
  try {
    await ActivityLog.create({ actor, action, module, targetId, meta });
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
};

module.exports = logActivity;
