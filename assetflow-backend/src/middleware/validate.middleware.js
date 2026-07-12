const { validationResult } = require('express-validator');
const { ApiError } = require('../utils/ApiResponse');

const validate = (validations) => async (req, res, next) => {
  try {
    for (const validation of validations) {
      await validation.run(req);
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(422, 'Validation failed', errors.array()));
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = validate;
