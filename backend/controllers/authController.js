const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, university, course, year, leetcode, gfg, github, isGoogle, googleId, avatar } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      university,
      course,
      year,
      leetcode,
      gfg,
      github,
      isGoogle: Boolean(isGoogle),
      googleId: googleId || '',
      avatar: avatar || ''
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isGoogle: user.isGoogle,
        googleId: user.googleId,
        avatar: user.avatar,
        university: user.university,
        course: user.course,
        year: user.year,
        leetcode: user.leetcode,
        gfg: user.gfg,
        github: user.github,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token (Standard Login)
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isGoogle: user.isGoogle,
        googleId: user.googleId,
        avatar: user.avatar,
        university: user.university,
        course: user.course,
        year: user.year,
        leetcode: user.leetcode,
        gfg: user.gfg,
        github: user.github,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Google OAuth Login / Register Sync
// @route   POST /api/auth/google
const googleAuth = async (req, res) => {
  try {
    const { email, name, googleId, avatar, university, course, year, leetcode, gfg, github } = req.body;

    let user = await User.findOne({ email });

    if (user) {
      // Update details and link Google status
      user.isGoogle = true;
      if (!user.googleId && googleId) user.googleId = googleId;
      if (avatar) user.avatar = avatar;
      if (university && !user.university) user.university = university;
      if (course && !user.course) user.course = course;
      if (year && !user.year) user.year = year;
      if (github && !user.github) user.github = github;
      await user.save();
    } else {
      // Create new Google-authenticated user
      user = await User.create({
        name,
        email,
        googleId: googleId || '',
        avatar: avatar || '',
        isGoogle: true,
        university: university || '',
        course: course || '',
        year: year || '',
        leetcode: leetcode || '',
        gfg: gfg || '',
        github: github || ''
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isGoogle: user.isGoogle,
      googleId: user.googleId,
      avatar: user.avatar,
      university: user.university,
      course: user.course,
      year: user.year,
      leetcode: user.leetcode,
      gfg: user.gfg,
      github: user.github,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, googleAuth, getMe };