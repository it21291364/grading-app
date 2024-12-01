const express = require('express');
const router = express.Router();
const gradingController = require('../controllers/gradingController');

// Route to start grading
router.get('/start', gradingController.startGrading);

// Route to fetch a specific student's results
router.get('/student/:studentId', gradingController.getStudentResults);

// Route to update a specific student's results
router.post('/student/:studentId', gradingController.updateStudentResults);

// Route to fetch a list of all students
router.get('/students', gradingController.getStudentList);

// Route to download grading results in various formats
router.get('/download/:format', gradingController.downloadResults);

// Route to fetch results for all students
router.get('/students/results', gradingController.getAllStudentResults);

module.exports = router;
