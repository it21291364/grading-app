// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const uploadRoutes = require('./routes/upload');
const gradingRoutes = require('./routes/grading');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/grading', gradingRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log(err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
