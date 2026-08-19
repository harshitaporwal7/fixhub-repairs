const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const RepairService = require('../models/RepairService');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');

const router = express.Router();

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
}

const POPULATE = [
  { path: 'device', select: 'name slug icon' },
  { path: 'brand', select: 'name slug' },
  { path: 'model', select: 'name slug' },
  { path: 'repairService', select: 'name category' },
  { path: 'location', select: 'name address city phone' },
];

// Create a booking. Works for logged-in customers and guests.
router.post(
  '/',
  optionalAuth,
  [
    body('customerName').trim().notEmpty().withMessage('Name is required'),
    body('customerEmail').isEmail().withMessage('A valid email is required'),
    body('customerPhone').trim().notEmpty().withMessage('Phone number is required'),
    body('device').notEmpty().withMessage('Device is required'),
    body('brand').notEmpty().withMessage('Brand is required'),
    body('model').notEmpty().withMessage('Model is required'),
    body('repairService').notEmpty().withMessage('Repair service is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('preferredDate').notEmpty().withMessage('Preferred date is required'),
    body('preferredTime').notEmpty().withMessage('Preferred time is required'),
  ],
  handleValidation,
  async (req, res, next) => {
    try {
      const repairService = await RepairService.findById(req.body.repairService);
      if (!repairService) {
        return res.status(404).json({ message: 'Selected repair service was not found.' });
      }

      const booking = await Booking.create({
        customer: req.user ? req.user._id : undefined,
        customerName: req.body.customerName,
        customerEmail: req.body.customerEmail,
        customerPhone: req.body.customerPhone,
        customerAddress: req.body.customerAddress,
        device: req.body.device,
        brand: req.body.brand,
        model: req.body.model,
        repairService: repairService._id,
        location: req.body.location,
        price: repairService.price,
        estimatedMinutes: repairService.estimatedMinutes,
        warrantyMonths: repairService.warrantyMonths,
        preferredDate: req.body.preferredDate,
        preferredTime: req.body.preferredTime,
        notes: req.body.notes,
      });

      const populated = await booking.populate(POPULATE);
      res.status(201).json(populated);
    } catch (err) {
      next(err);
    }
  }
);

// Admin: list all bookings with search/filter
router.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.from || req.query.to) {
      filter.preferredDate = {};
      if (req.query.from) filter.preferredDate.$gte = new Date(req.query.from);
      if (req.query.to) filter.preferredDate.$lte = new Date(req.query.to);
    }
    if (req.query.search) {
      const re = new RegExp(req.query.search, 'i');
      filter.$or = [{ bookingId: re }, { customerName: re }, { customerEmail: re }];
    }

    const bookings = await Booking.find(filter).populate(POPULATE).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

// Customer: their own bookings
router.get('/my', protect, async (req, res, next) => {
  try {
    const bookings = await Booking.find({ customer: req.user._id })
      .populate(POPULATE)
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

// Public: track a booking by reference ID + email (no auth required)
router.get('/track/:bookingId', async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email is required to track a booking.' });

    const booking = await Booking.findOne({
      bookingId: req.params.bookingId.toUpperCase(),
      customerEmail: email.toLowerCase(),
    }).populate(POPULATE);

    if (!booking) return res.status(404).json({ message: 'No booking found with that ID and email.' });
    res.json(booking);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', protect, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate(POPULATE);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    const isOwner = booking.customer && booking.customer.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have access to this booking.' });
    }

    res.json(booking);
  } catch (err) {
    next(err);
  }
});

// Admin: update status, price, internal notes
router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const allowed = ['status', 'price', 'internalNotes', 'preferredDate', 'preferredTime'];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const booking = await Booking.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate(POPULATE);

    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    res.json(booking);
  } catch (err) {
    next(err);
  }
});

// Customer or admin: cancel a booking
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    const isOwner = booking.customer && booking.customer.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have access to this booking.' });
    }

    if (req.user.role === 'admin') {
      await booking.deleteOne();
      return res.json({ message: 'Booking deleted.' });
    }

    booking.status = 'Cancelled';
    await booking.save();
    res.json(booking);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
