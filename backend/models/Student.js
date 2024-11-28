// models/Student.js
const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  studentId: String,
  moduleCode: String,
  answers: [
    {
      questionNo: Number,
      studentAnswer: String,
      studentMarks: Number,
      feedback: String,
    },
  ],
  totalMarks: Number,
});

module.exports = mongoose.model('Student', StudentSchema);
