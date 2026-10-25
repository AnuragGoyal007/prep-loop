const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    university: { type: String, default: '' },
    course: { type: String, default: '' },
    year: { type: String, default: '' },
    leetcode: { type: String, default: '' },
    gfg: { type: String, default: '' },
    github: { type: String, default: '' },
    isGoogle: { type: Boolean, default: false },
    googleId: { type: String, default: '' },
    avatar: { type: String, default: '' }
  },
  { timestamps: true }
);

// Hash password before saving if modified
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password helper
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);