const SheetTopic = require('../models/SheetTopic');

// @desc    Get all core CS sheet topics
// @route   GET /api/sheets/core
const getSheetTopics = async (req, res) => {
  try {
    const { subject, category, difficulty } = req.query;
    let query = {};

    if (subject && subject !== 'all') query.subject = subject.toLowerCase();
    if (category) query.category = category;
    if (difficulty && difficulty !== 'all') query.difficulty = difficulty.toLowerCase();

    const topics = await SheetTopic.find(query).sort({ subject: 1, category: 1 });
    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single topic by topicId
// @route   GET /api/sheets/core/:topicId
const getTopicById = async (req, res) => {
  try {
    const topic = await SheetTopic.findOne({ topicId: req.params.topicId });
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    res.json(topic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSheetTopics, getTopicById };
