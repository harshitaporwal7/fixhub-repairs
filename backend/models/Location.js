const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    latitude: { type: Number },
    longitude: { type: Number },
    openingHours: [
      {
        day: { type: String },
        hours: { type: String },
      },
    ],
    services: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Location', locationSchema);
