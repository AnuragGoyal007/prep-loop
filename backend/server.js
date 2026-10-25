const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectMongoDB = require('./config/db');

dotenv.config();

// Connect to Database
connectMongoDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Request logger for live debugging
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    console.log(`📡 [${req.method}] ${req.originalUrl}`);
  }
  next();
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/scheduler', require('./routes/schedulerRoutes'));
app.use('/api/sheets', require('./routes/sheetRoutes'));

// Serve Static Frontend files (Allows opening http://localhost:5000 directly!)
app.use(express.static(path.join(__dirname, '../frontend')));

// Fallback: serve frontend index.html for any other web route
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;