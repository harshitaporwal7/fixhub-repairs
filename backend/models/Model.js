const mongoose = require('mongoose');

const modelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. "iPhone 15 Pro"
    slug: { type: String, required: true, trim: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
    device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
    releaseYear: { type: Number },
    image: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

modelSchema.index({ slug: 1, brand: 1 }, { unique: true });

module.exports = mongoose.model('Model', modelSchema);
