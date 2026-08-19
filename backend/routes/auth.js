const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { protect } = require('../middleware/auth');

const router = express.Router();

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
}

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').optional({ checkFalsy: true }).isString(),
  ],
  handleValidation,
  async (req, res, next) => {
    try {
      const { name, email, password, phone, address } = req.body;

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ message: 'An account with this email already exists.' });
      }

      const user = await User.create({ name, email, password, phone, address });
      const token = generateToken(user._id);

      res.status(201).json({ token, user: user.toSafeObject() });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  handleValidation,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select('+password');

      if (!user || !user.isActive) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const token = generateToken(user._id);
      res.json({ token, user: user.toSafeObject() });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
});

router.put('/me', protect, async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    if (name !== undefined) req.user.name = name;
    if (phone !== undefined) req.user.phone = phone;
    if (address !== undefined) req.user.address = address;
    await req.user.save();
    res.json({ user: req.user.toSafeObject() });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
