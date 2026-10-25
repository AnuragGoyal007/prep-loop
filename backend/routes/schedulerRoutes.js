const express = require('express');
const router = express.Router();
const { getSlots, createSlot, deleteSlot, getBookings, bookSlot, cancelBooking, submitFeedback } = require('../controllers/schedulerController');

router.route('/slots')
  .get(getSlots)
  .post(createSlot);

router.route('/slots/:id')
  .delete(deleteSlot);

router.route('/bookings')
  .get(getBookings)
  .post(bookSlot);

router.route('/bookings/:id')
  .delete(cancelBooking);

router.post('/bookings/:id/feedback', submitFeedback);

module.exports = router;