const Slot = require('../models/Slot');
const Booking = require('../models/Booking');

// @desc    Get all interview slots
// @route   GET /api/scheduler/slots
const getSlots = async (req, res) => {
  try {
    const slots = await Slot.find();
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new slot
// @route   POST /api/scheduler/slots
const createSlot = async (req, res) => {
  try {
    const { hostName, day, time, tag, topic, duration, link } = req.body;
    const finalTopic = topic || tag || 'DSA';
    const finalTag = tag || topic || 'DSA';
    const finalDuration = Number(duration) || 60;
    const slot = await Slot.create({
      hostName,
      day,
      time,
      tag: finalTag,
      topic: finalTopic,
      duration: finalDuration,
      link: link || ''
    });
    res.status(201).json(slot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings
// @route   GET /api/scheduler/bookings
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('slotId');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Book an interview slot
// @route   POST /api/scheduler/bookings
const bookSlot = async (req, res) => {
  try {
    const { slotId, requesterName } = req.body;
    const slot = await Slot.findById(slotId);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    if (slot.isBooked) return res.status(400).json({ message: 'Slot already booked' });

    slot.isBooked = true;
    await slot.save();

    const booking = await Booking.create({ slotId, requesterName });
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit reflection feedback for booking
// @route   POST /api/scheduler/bookings/:id/feedback
const submitFeedback = async (req, res) => {
  try {
    const { communication, problemSolving, codeQuality, comment } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.communication = communication;
    booking.problemSolving = problemSolving;
    booking.codeQuality = codeQuality;
    booking.comment = comment;
    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an interview slot
// @route   DELETE /api/scheduler/slots/:id
const deleteSlot = async (req, res) => {
  try {
    const slot = await Slot.findByIdAndDelete(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    await Booking.deleteMany({ slotId: req.params.id });
    res.json({ message: 'Slot removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel booking & free up slot
// @route   DELETE /api/scheduler/bookings/:id
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.slotId) {
      await Slot.findByIdAndUpdate(booking.slotId, { isBooked: false });
    }
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking cancelled and slot freed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSlots, createSlot, deleteSlot, getBookings, bookSlot, cancelBooking, submitFeedback };