const mongoose = require('mongoose');

const sheetTopicSchema = new mongoose.Schema(
  {
    topicId: { type: String, required: true, unique: true },
    subject: { type: String, required: true },
    category: { type: String, required: true },
    title: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    isHighFrequency: { type: Boolean, default: false },
    description: { type: String, default: '' },
    keyTakeaways: { type: String, default: '' },
    link: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SheetTopic', sheetTopicSchema);
