const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topic: { type: String, required: true, trim: true },
    tag: { type: String, required: true, enum: ['DSA', 'DBMS', 'CN', 'OS'] },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    outcome: { type: String, enum: ['solved', 'missed'], default: 'solved' },
    timeTaken: { type: Number, default: 0 },
    repetition: { type: Number, default: 0 },
    interval: { type: Number, default: 1 },
    easeFactor: { type: Number, default: 2.5 },
    nextReviewDate: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);