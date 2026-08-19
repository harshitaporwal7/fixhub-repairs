const express = require('express');
const Device = require('../models/Device');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const filter = req.query.all === 'true' ? {} : { isActive: true };
    const devices = await Device.find(filter).sort({ sortOrder: 1, name: 1 });
    res.json(devices);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) return res.status(404).json({ message: 'Device not found.' });
    res.json(device);
  } catch (err) {
    next(err);
  }
});

router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const device = await Device.create(req.body);
    res.status(201).json(device);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const device = await Device.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!device) return res.status(404).json({ message: 'Device not found.' });
    res.json(device);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const device = await Device.findByIdAndDelete(req.params.id);
    if (!device) return res.status(404).json({ message: 'Device not found.' });
    res.json({ message: 'Device deleted.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
