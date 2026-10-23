const express = require('express');
const router = express.Router();
const { getSlots, createSlot, getBookings, bookSlot, submitFeedback } = require('../controllers/schedulerController');

router.route('/slots')
  .get(getSlots)
  .post(createSlot);

router.route('/bookings')
  .get(getBookings)
  .post(bookSlot);

router.post('/bookings/:id/feedback', submitFeedback);

module.exports = router;