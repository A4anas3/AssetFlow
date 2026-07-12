const express = require('express');
const router = express.Router();
const { signup, login, logout, forgotPassword, resetPassword, getMe, refreshToken } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { signupValidator, loginValidator, forgotPasswordValidator, resetPasswordValidator } = require('../validators/auth.validator');

router.post('/signup', validate(signupValidator), signup);
router.post('/login', validate(loginValidator), login);
router.post('/logout', protect, logout);
router.post('/forgot-password', validate(forgotPasswordValidator), forgotPassword);
router.post('/reset-password', validate(resetPasswordValidator), resetPassword);
router.get('/me', protect, getMe);
router.post('/refresh-token', refreshToken);

module.exports = router;
