const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectMongoDB = require('./config/db');

dotenv.config();

// Connect to Database
connectMongoDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/scheduler', require('./routes/schedulerRoutes'));

// Root health check endpoint
app.get('/', (req, res) => {
  res.send('PrepLoop Phase 2 API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});