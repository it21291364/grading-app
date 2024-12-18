require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import route handlers
const uploadRoutes = require('./routes/upload');
const gradingRoutes = require('./routes/grading');
const moduleRoutes = require('./routes/module');

const app = express();

// Middleware to parse JSON payloads
app.use(express.json());
app.use(cors());

// Define routes for file uploads and grading operations
app.use('/api/upload', uploadRoutes);
app.use('/api/grading', gradingRoutes);
app.use('/api/module', moduleRoutes);

// Connect to MongoDB using credentials from the environment
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log(err));

// Start the server and listen on the specified port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
