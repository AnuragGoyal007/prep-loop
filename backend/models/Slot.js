const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema(
  {
    hostName: { type: String, required: true },
    day: { type: String, required: true },
    time: { type: String, required: true },
    tag: { type: String, required: true },
    link: { type: String, required: true },
    isBooked: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Slot', slotSchema);