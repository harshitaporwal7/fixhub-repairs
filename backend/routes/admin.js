const express = require('express');
const Booking = require('../models/Booking');
const User = require('../models/User');
const RepairService = require('../models/RepairService');
const Device = require('../models/Device');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();
router.use(protect, adminOnly);

// GET /api/admin/stats - headline dashboard numbers + chart data
router.get('/stats', async (req, res, next) => {
  try {
    const [totalBookings, pendingBookings, completedBookings, totalCustomers] = await Promise.all([
      Booking.countDocuments({}),
      Booking.countDocuments({ status: 'Pending' }),
      Booking.countDocuments({ status: 'Completed' }),
      User.countDocuments({ role: 'customer' }),
    ]);

    const revenueAgg = await Booking.aggregate([
      { $match: { status: { $in: ['Completed', 'Ready for Pickup', 'In Repair', 'Confirmed'] } } },
      { $group: { _id: null, total: { $sum: '$price' } } },
    ]);
    const revenue = revenueAgg[0] ? revenueAgg[0].total : 0;

    const bookingsOverTime = await Booking.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 30 },
    ]);

    const revenueOverTime = await Booking.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$price' },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 30 },
    ]);

    const repairCategories = await Booking.aggregate([
      {
        $lookup: {
          from: 'repairservices',
          localField: 'repairService',
          foreignField: '_id',
          as: 'repair',
        },
      },
      { $unwind: '$repair' },
      { $group: { _id: '$repair.category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const devicePopularity = await Booking.aggregate([
      {
        $lookup: { from: 'devices', localField: 'device', foreignField: '_id', as: 'deviceDoc' },
      },
      { $unwind: '$deviceDoc' },
      { $group: { _id: '$deviceDoc.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      totalBookings,
      pendingBookings,
      completedBookings,
      totalCustomers,
      revenue,
      bookingsOverTime,
      revenueOverTime,
      repairCategories,
      devicePopularity,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/customers - list customers
router.get('/customers', async (req, res, next) => {
  try {
    const filter = { role: 'customer' };
    if (req.query.search) {
      const re = new RegExp(req.query.search, 'i');
      filter.$or = [{ name: re }, { email: re }];
    }
    const customers = await User.find(filter).sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    next(err);
  }
});

router.put('/customers/:id', async (req, res, next) => {
  try {
    const allowed = ['name', 'phone', 'address', 'isActive'];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });
    const customer = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'customer' },
      updates,
      { new: true, runValidators: true }
    );
    if (!customer) return res.status(404).json({ message: 'Customer not found.' });
    res.json(customer.toSafeObject());
  } catch (err) {
    next(err);
  }
});

router.delete('/customers/:id', async (req, res, next) => {
  try {
    const customer = await User.findOneAndDelete({ _id: req.params.id, role: 'customer' });
    if (!customer) return res.status(404).json({ message: 'Customer not found.' });
    res.json({ message: 'Customer deleted.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
