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


// In-memory or User document bookmark toggle
// @desc    Toggle bookmark status for a core sheet topic
// @route   POST /api/sheets/bookmark/:topicId
const toggleTopicBookmark = async (req, res) => {
  try {
    const { topicId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Initialize bookmarkedTopics array if not present
    if (!user.bookmarkedTopics) user.bookmarkedTopics = [];

    const index = user.bookmarkedTopics.indexOf(topicId);
    let isBookmarked = false;

    if (index > -1) {
      user.bookmarkedTopics.splice(index, 1); // Remove bookmark
    } else {
      user.bookmarkedTopics.push(topicId);    // Add bookmark
      isBookmarked = true;
    }

    await user.save();
    res.json({
      topicId,
      isBookmarked,
      totalBookmarks: user.bookmarkedTopics.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSheetTopics, getTopicById,toggleTopicBookmark };
