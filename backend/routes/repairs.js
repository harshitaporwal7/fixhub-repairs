const express = require('express');
const RepairService = require('../models/RepairService');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/categories', (req, res) => {
  res.json(RepairService.CATEGORIES);
});

router.get('/', async (req, res, next) => {
  try {
    const filter = req.query.all === 'true' ? {} : { isActive: true };
    if (req.query.model) filter.model = req.query.model;
    if (req.query.brand) filter.brand = req.query.brand;
    if (req.query.device) filter.device = req.query.device;
    if (req.query.category) filter.category = req.query.category;

    const repairs = await RepairService.find(filter)
      .populate('device', 'name slug')
      .populate('brand', 'name slug')
      .populate('model', 'name slug')
      .sort({ category: 1, name: 1 });

    res.json(repairs);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const repair = await RepairService.findById(req.params.id)
      .populate('device')
      .populate('brand')
      .populate('model');
    if (!repair) return res.status(404).json({ message: 'Repair service not found.' });
    res.json(repair);
  } catch (err) {
    next(err);
  }
});

router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const repair = await RepairService.create(req.body);
    res.status(201).json(repair);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const repair = await RepairService.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!repair) return res.status(404).json({ message: 'Repair service not found.' });
    res.json(repair);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const repair = await RepairService.findByIdAndDelete(req.params.id);
    if (!repair) return res.status(404).json({ message: 'Repair service not found.' });
    res.json({ message: 'Repair service deleted.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
