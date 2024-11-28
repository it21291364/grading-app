// routes/grading.js
const express = require('express');
const router = express.Router();
const gradingController = require('../controllers/gradingController');

router.get('/start', gradingController.startGrading);
// routes/grading.js
router.get('/student/:studentId', gradingController.getStudentResults);
// routes/grading.js
router.post('/student/:studentId', gradingController.updateStudentResults);

router.get('/students', gradingController.getStudentList);
// routes/grading.js
router.get('/download/:format', gradingController.downloadResults);

module.exports = router;
