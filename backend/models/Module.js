const mongoose = require('mongoose');

// Define the schema for a module
const ModuleSchema = new mongoose.Schema({
  moduleName: String, // Name of the module
  moduleCode: String, // Unique code for the module
  batch: String, // Batch associated with the module
  academicYear: String, // Academic year of the module
  semester: String, // Semester in which the module is taught
  questions: [  // Array of questions in the module
    {
      questionNo: Number, // Question number
      question: String,  // Question text
      expectedAnswer: String, // Expected correct answer
      instruction: String, // Additional grading instructions
      allocatedMarks: Number, // Marks allocated for the question
    },
  ],
});

module.exports = mongoose.model('Module', ModuleSchema);
