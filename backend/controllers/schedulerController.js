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
    const { hostName, day, time, tag, link } = req.body;
    const slot = await Slot.create({ hostName, day, time, tag, link });
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

module.exports = { getSlots, createSlot, getBookings, bookSlot, submitFeedback };