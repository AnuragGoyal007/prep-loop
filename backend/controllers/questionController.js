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

// @desc    Update a question (SM-2 revision attempt recalculation)
// @route   PUT /api/questions/:id
const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findOne({ _id: req.params.id, user: req.user._id });
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const { tag, difficulty, outcome, timeTaken, repetition, interval, easeFactor, nextReviewDate } = req.body;

    if (tag) question.tag = tag;
    if (difficulty) question.difficulty = difficulty;
    if (outcome) question.outcome = outcome;
    if (timeTaken !== undefined) question.timeTaken = timeTaken;
    if (repetition !== undefined) question.repetition = repetition;
    if (interval !== undefined) question.interval = interval;
    if (easeFactor !== undefined) question.easeFactor = easeFactor;
    if (nextReviewDate) question.nextReviewDate = nextReviewDate;

    const updated = await question.save();
    res.json(updated);
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

// @desc    Get questions that are due for review (SM-2 review horizon)
// @route   GET /api/questions/due
const getDueQuestions = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const dueQuestions = await Question.find({
      user: req.user._id,
      nextReviewDate: { $lte: today }
    }).sort({ nextReviewDate: 1 });

    res.json({
      count: dueQuestions.length,
      questions: dueQuestions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get preparation summary stats for authenticated user
// @route   GET /api/questions/stats
const getQuestionStats = async (req, res) => {
  try {
    const stats = await Question.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalQuestions: { $sum: 1 },
          totalMinutesSpent: { $sum: '$timeTaken' },
          avgEaseFactor: { $avg: '$easeFactor' },
          solvedCount: {
            $sum: { $cond: [{ $eq: ['$outcome', 'solved'] }, 1, 0] }
          },
          missedCount: {
            $sum: { $cond: [{ $eq: ['$outcome', 'missed'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json(stats[0] || {
      totalQuestions: 0,
      totalMinutesSpent: 0,
      avgEaseFactor: 2.5,
      solvedCount: 0,
      missedCount: 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single question attempt by ID
// @route   GET /api/questions/:id
const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset SM-2 schedule to day 1 for a question (Lapse recovery)
// @route   POST /api/questions/:id/reset
const resetQuestionSM2 = async (req, res) => {
  try {
    const question = await Question.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Reset SM-2 state variables back to initial defaults
    question.repetition = 0;
    question.interval = 1;
    question.easeFactor = 2.5;
    question.nextReviewDate = new Date();

    const updated = await question.save();
    res.json({ message: 'SM-2 schedule reset to Day 1', question: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = { getQuestions, addQuestion, updateQuestion, deleteQuestion ,getDueQuestions,
  getQuestionStats,
  getQuestionById,
  resetQuestionSM2};