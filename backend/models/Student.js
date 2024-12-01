const mongoose = require('mongoose');

// Define the schema for a student
const StudentSchema = new mongoose.Schema({
  studentId: String, // Unique ID for the student
  moduleCode: String, // Module code the student is associated with
  answers: [ // Array of answers submitted by the student
    {
      questionNo: Number, // Question number
      studentAnswer: String, // Student's answer text
      studentMarks: Number, // Marks awarded for the answer
      feedback: String, // Feedback provided for the answer
    },
  ],
  totalMarks: Number, // Total marks awarded to the student
});

module.exports = mongoose.model('Student', StudentSchema);
