const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. "iPhone", "Laptop"
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    icon: { type: String, default: 'smartphone' }, // lucide icon name
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Device', deviceSchema);
