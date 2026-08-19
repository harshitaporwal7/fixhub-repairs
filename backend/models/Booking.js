const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const STATUSES = ['Pending', 'Confirmed', 'In Repair', 'Ready for Pickup', 'Completed', 'Cancelled'];

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true, default: () => `FX-${nanoid(8).toUpperCase()}` },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional - guest bookings allowed
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, trim: true, lowercase: true },
    customerPhone: { type: String, required: true, trim: true },
    customerAddress: { type: String, trim: true },

    device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
    model: { type: mongoose.Schema.Types.ObjectId, ref: 'Model', required: true },
    repairService: { type: mongoose.Schema.Types.ObjectId, ref: 'RepairService', required: true },
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },

    price: { type: Number, required: true },
    estimatedMinutes: { type: Number, required: true },
    warrantyMonths: { type: Number },

    preferredDate: { type: Date, required: true },
    preferredTime: { type: String, required: true }, // e.g. "10:30 AM"
    notes: { type: String, trim: true },

    status: { type: String, enum: STATUSES, default: 'Pending' },
    internalNotes: { type: String, trim: true },
  },
  { timestamps: true }
);

bookingSchema.statics.STATUSES = STATUSES;

module.exports = mongoose.model('Booking', bookingSchema);
