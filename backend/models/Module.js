const mongoose = require('mongoose');

/**
 * @typedef {Object} Question
 * @property {number} questionNo - The number of the question.
 * @property {string} question - The text of the question.
 * @property {string} expectedAnswer - The expected answer for the question.
 * @property {string} instruction - Instructions for the question.
 * @property {number} allocatedMarks - The marks allocated for the question.
 */

/**
 * @typedef {Object} ModuleSchema
 * @property {string} moduleName - The name of the module.
 * @property {string} moduleCode - The code of the module.
 * @property {string} batch - The batch associated with the module.
 * @property {string} academicYear - The academic year of the module.
 * @property {string} semester - The semester of the module.
 * @property {Question[]} questions - The list of questions in the module.
 */
const ModuleSchema = new mongoose.Schema({
  moduleName: String,
  moduleCode: String,
  batch: String,
  academicYear: String,
  semester: String,
  questions: [
    {
      questionNo: Number,
      question: String,
      expectedAnswer: String,
      instruction: String,
      allocatedMarks: Number,
    },
  ],
});

module.exports = mongoose.model('Module', ModuleSchema);
