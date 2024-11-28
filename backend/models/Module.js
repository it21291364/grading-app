// models/Module.js
const mongoose = require('mongoose');

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
