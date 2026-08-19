const express = require('express');
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
}

// Public: approved reviews only
router.get('/', async (req, res, next) => {
  try {
    const filter = req.query.all === 'true' ? {} : { status: 'Approved' };
    const reviews = await Review.find(filter).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  protect,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').trim().notEmpty().withMessage('Please write a short comment'),
    body('booking').notEmpty().withMessage('A completed booking is required to leave a review'),
  ],
  handleValidation,
  async (req, res, next) => {
    try {
      const booking = await Booking.findOne({
        _id: req.body.booking,
        customer: req.user._id,
        status: 'Completed',
      }).populate('device', 'name');

      if (!booking) {
        return res.status(400).json({
          message: 'You can only review a device after its repair has been completed.',
        });
      }

      const existing = await Review.findOne({ booking: booking._id });
      if (existing) {
        return res.status(409).json({ message: 'You already reviewed this booking.' });
      }

      const review = await Review.create({
        customer: req.user._id,
        customerName: req.user.name,
        booking: booking._id,
        deviceRepaired: booking.device ? booking.device.name : '',
        rating: req.body.rating,
        comment: req.body.comment,
      });

      res.status(201).json(review);
    } catch (err) {
      next(err);
    }
  }
);

router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }
    const review = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!review) return res.status(404).json({ message: 'Review not found.' });
    res.json(review);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found.' });
    res.json({ message: 'Review deleted.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
