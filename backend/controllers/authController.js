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
      // If user was initiated via Google OAuth, allow completing academic profile
      if (isGoogle || userExists.isGoogle) {
        userExists.isGoogle = true;
        if (name) userExists.name = name;
        if (university) userExists.university = university;
        if (course) userExists.course = course;
        if (year) userExists.year = year;
        if (leetcode) userExists.leetcode = leetcode;
        if (gfg) userExists.gfg = gfg;
        if (github) userExists.github = github;
        if (googleId) userExists.googleId = googleId;
        if (avatar) userExists.avatar = avatar;
        if (password && password.length >= 4) {
          userExists.password = password;
        }
        await userExists.save();

        return res.status(200).json({
          _id: userExists._id,
          name: userExists.name,
          email: userExists.email,
          isGoogle: userExists.isGoogle,
          googleId: userExists.googleId,
          avatar: userExists.avatar,
          university: userExists.university,
          course: userExists.course,
          year: userExists.year,
          leetcode: userExists.leetcode,
          gfg: userExists.gfg,
          github: userExists.github,
          token: generateToken(userExists._id)
        });
      }
      return res.status(400).json({ message: 'User already exists' });
    }

    const userData = {
      name,
      email,
      university: university || '',
      course: course || '',
      year: year || '',
      leetcode: leetcode || '',
      gfg: gfg || '',
      github: github || '',
      isGoogle: Boolean(isGoogle),
      googleId: googleId || '',
      avatar: avatar || ''
    };
    if (password && password.length >= 4) {
      userData.password = password;
    }

    const user = await User.create(userData);

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
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.isGoogle && !user.password) {
      return res.status(401).json({
        message: 'This account was registered via Google. Please use Continue with Google to sign in.'
      });
    }

    if (await user.matchPassword(password)) {
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
    const { email, name, password, googleId, avatar, university, course, year, leetcode, gfg, github } = req.body;

    let user = await User.findOne({ email });

    if (user) {
      // Update details and link Google status
      user.isGoogle = true;
      if (name && !user.name) user.name = name;
      if (!user.googleId && googleId) user.googleId = googleId;
      if (avatar) user.avatar = avatar;
      if (university) user.university = university;
      if (course) user.course = course;
      if (year) user.year = year;
      if (leetcode) user.leetcode = leetcode;
      if (gfg) user.gfg = gfg;
      if (github) user.github = github;
      if (password && password.length >= 4) user.password = password;
      await user.save();
    } else {
      // Create new Google-authenticated user
      const userData = {
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
      };
      if (password && password.length >= 4) {
        userData.password = password;
      }
      user = await User.create(userData);
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