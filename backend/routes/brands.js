const express = require('express');
const Brand = require('../models/Brand');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const filter = req.query.all === 'true' ? {} : { isActive: true };
    if (req.query.device) filter.device = req.query.device;
    const brands = await Brand.find(filter).populate('device', 'name slug').sort({ name: 1 });
    res.json(brands);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const brand = await Brand.findById(req.params.id).populate('device', 'name slug');
    if (!brand) return res.status(404).json({ message: 'Brand not found.' });
    res.json(brand);
  } catch (err) {
    next(err);
  }
});

router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const brand = await Brand.create(req.body);
    res.status(201).json(brand);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!brand) return res.status(404).json({ message: 'Brand not found.' });
    res.json(brand);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Brand not found.' });
    res.json({ message: 'Brand deleted.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
