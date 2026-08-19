const express = require('express');
const DeviceModel = require('../models/Model');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const filter = req.query.all === 'true' ? {} : { isActive: true };
    if (req.query.brand) filter.brand = req.query.brand;
    if (req.query.device) filter.device = req.query.device;
    const models = await DeviceModel.find(filter)
      .populate('brand', 'name slug')
      .populate('device', 'name slug')
      .sort({ releaseYear: -1, name: 1 });
    res.json(models);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const model = await DeviceModel.findById(req.params.id).populate('brand').populate('device');
    if (!model) return res.status(404).json({ message: 'Model not found.' });
    res.json(model);
  } catch (err) {
    next(err);
  }
});

router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const model = await DeviceModel.create(req.body);
    res.status(201).json(model);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const model = await DeviceModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!model) return res.status(404).json({ message: 'Model not found.' });
    res.json(model);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const model = await DeviceModel.findByIdAndDelete(req.params.id);
    if (!model) return res.status(404).json({ message: 'Model not found.' });
    res.json({ message: 'Model deleted.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
