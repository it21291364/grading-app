const express = require('express');
const router = express.Router();
const gradingController = require('../controllers/gradingController');

// Route to start grading for a specific module
router.get('/start/:moduleId', gradingController.startGrading);

// Route to fetch a specific student's results
router.get('/student/:moduleId/:studentId', gradingController.getStudentResults);

// Route to update a specific student's results
router.post('/student/:moduleId/:studentId', gradingController.updateStudentResults);

// Route to fetch a list of all students for a module
router.get('/students/:moduleId', gradingController.getStudentList);

// Route to download grading results for a module in various formats
router.get('/download/:moduleId/:format', gradingController.downloadResults);

// Route to fetch results for all students in a module
router.get('/students/results/:moduleId', gradingController.getAllStudentResults);

module.exports = router;
