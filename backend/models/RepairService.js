const mongoose = require('mongoose');

const REPAIR_CATEGORIES = [
  'Screen Replacement',
  'Battery Replacement',
  'Charging Port',
  'Camera Repair',
  'Speaker/Microphone',
  'Water Damage',
  'Software Issues',
  'Back Glass',
  'Other Repairs',
];

const repairServiceSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, enum: REPAIR_CATEGORIES },
    name: { type: String, required: true, trim: true }, // e.g. "Screen Replacement"
    description: { type: String, trim: true },
    device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
    model: { type: mongoose.Schema.Types.ObjectId, ref: 'Model', required: true },
    price: { type: Number, required: true, min: 0 },
    estimatedMinutes: { type: Number, required: true, min: 5 },
    warrantyMonths: { type: Number, required: true, default: 6 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

repairServiceSchema.statics.CATEGORIES = REPAIR_CATEGORIES;

module.exports = mongoose.model('RepairService', repairServiceSchema);
