const mongoose = require('mongoose');

/**
 * @typedef {Object} StudentSchema
 * @property {String} studentId - The unique identifier for the student.
 * @property {String} moduleCode - The code of the module the student is enrolled in.
 * @property {Array.<Object>} answers - An array of answer objects.
 * @property {Number} answers.questionNo - The question number.
 * @property {String} answers.studentAnswer - The student's answer to the question.
 * @property {Number} answers.studentMarks - The marks awarded for the student's answer.
 * @property {String} answers.feedback - The feedback provided for the student's answer.
 * @property {Number} totalMarks - The total marks obtained by the student.
 */
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
