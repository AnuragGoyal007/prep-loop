const express = require('express');
const router = express.Router();
const { getQuestions, addQuestion, deleteQuestion } = require('../controllers/questionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getQuestions)
  .post(protect, addQuestion);

router.route('/:id')
  .delete(protect, deleteQuestion);

module.exports = router;