const express = require('express');
const router = express.Router();
const { getQuestions, addQuestion, updateQuestion, deleteQuestion ,getDueQuestions,
  getQuestionStats,
  getQuestionById,
  resetQuestionSM2,getActivityHeatmap} = require('../controllers/questionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getQuestions)
  .post(protect, addQuestion);

router.route('/:id')
  .put(protect, updateQuestion)
  .delete(protect, deleteQuestion)
  .get(protect, getQuestionById);

router.post('/:id/reset', protect, resetQuestionSM2);

router.get('/due', protect, getDueQuestions);
router.get('/stats', protect, getQuestionStats);


router.get('/activity', protect, getActivityHeatmap);

module.exports = router;


