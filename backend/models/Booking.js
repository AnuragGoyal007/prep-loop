const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot', required: true },
    requesterName: { type: String, required: true },
    communication: { type: Number, min: 1, max: 5 },
    problemSolving: { type: Number, min: 1, max: 5 },
    codeQuality: { type: Number, min: 1, max: 5 },
    comment: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);