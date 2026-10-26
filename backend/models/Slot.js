const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema(
  {
    hostName: { type: String, required: true },
    day: { type: String, required: true },
    time: { type: String, required: true },
    tag: { type: String, default: 'DSA' },
    topic: { type: String, default: 'DSA' },
    duration: { type: Number, default: 60 },
    link: { type: String, default: '' },
    isBooked: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Slot', slotSchema);