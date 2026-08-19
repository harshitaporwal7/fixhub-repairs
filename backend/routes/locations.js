const express = require('express');
const Location = require('../models/Location');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const filter = req.query.all === 'true' ? {} : { isActive: true };
    const locations = await Location.find(filter).sort({ name: 1 });
    res.json(locations);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) return res.status(404).json({ message: 'Location not found.' });
    res.json(location);
  } catch (err) {
    next(err);
  }
});

router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const location = await Location.create(req.body);
    res.status(201).json(location);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const location = await Location.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!location) return res.status(404).json({ message: 'Location not found.' });
    res.json(location);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);
    if (!location) return res.status(404).json({ message: 'Location not found.' });
    res.json({ message: 'Location deleted.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
