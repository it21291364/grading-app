// routes/upload.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/multerConfig');
const uploadController = require('../controllers/uploadController');

router.post('/', upload.fields([
  { name: 'markingGuide', maxCount: 1 },
  { name: 'studentAnswers', maxCount: 1 },
]), uploadController.handleFileUpload);

module.exports = router;
