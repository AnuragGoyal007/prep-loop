const Question = require('../models/Question');

// @desc    Get all questions for authenticated user
// @route   GET /api/questions
const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ user: req.user._id }).sort({ nextReviewDate: 1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a question attempt
// @route   POST /api/questions
const addQuestion = async (req, res) => {
  try {
    const { topic, tag, difficulty, outcome, timeTaken, repetition, interval, easeFactor, nextReviewDate } = req.body;

    const question = await Question.create({
      user: req.user._id,
      topic,
      tag,
      difficulty,
      outcome,
      timeTaken,
      repetition,
      interval,
      easeFactor,
      nextReviewDate
    });

    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a question
// @route   DELETE /api/questions/:id
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json({ message: 'Question removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getQuestions, addQuestion, deleteQuestion };