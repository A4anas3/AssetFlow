const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword, updateAvatar } = require('../controllers/profile.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { updateProfileValidator, changePasswordValidator } = require('../validators/profile.validator');
const upload = require('../utils/upload');

router.use(protect);
router.get('/', getProfile);
router.put('/', validate(updateProfileValidator), updateProfile);
router.patch('/password', validate(changePasswordValidator), changePassword);
router.patch('/avatar', upload.single('avatar'), updateAvatar);

module.exports = router;
