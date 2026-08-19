const express = require('express');
const { body, validationResult } = require('express-validator');
const ContactRequest = require('../models/ContactRequest');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
}

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('A valid email is required'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
  ],
  handleValidation,
  async (req, res, next) => {
    try {
      const request = await ContactRequest.create(req.body);
      res.status(201).json({ message: 'Thanks for reaching out — we will get back to you shortly.', request });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const requests = await ContactRequest.find(filter).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const { status } = req.body;
    const request = await ContactRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!request) return res.status(404).json({ message: 'Contact request not found.' });
    res.json(request);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
