const express = require('express');
const router = express.Router();
const upload = require('../middleware/multerConfig');
const uploadController = require('../controllers/uploadController');

// Define the route for handling file uploads
router.post('/', upload.fields([ // Define multiple file fields for the request
  { name: 'markingGuide', maxCount: 1 }, // Field for marking guide (1 file)
  { name: 'studentAnswers', maxCount: 1 }, // Field for student answers (1 file)
]), uploadController.handleFileUpload); // Call the controller function to process the request

module.exports = router;
