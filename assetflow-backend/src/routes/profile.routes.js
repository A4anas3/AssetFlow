const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword,
  updateAvatar,
} = require('../controllers/profile.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { updateProfileValidator, changePasswordValidator } = require('../validators/profile.validator');
const upload = require('../utils/upload');

router.use(protect);
router.get('/', getProfile);
router.put('/', validate(updateProfileValidator), updateProfile);
router.patch('/password', validate(changePasswordValidator), changePassword);
// Updated to use named avatar upload from new upload utility
router.patch('/avatar', upload.avatar.middleware, upload.avatar.upload, updateAvatar);

module.exports = router;
