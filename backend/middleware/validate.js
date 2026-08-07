const { validationResult } = require('express-validator');

// Run after express-validator check(...) chains to bail out with 400 on failure
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

module.exports = validate;
