// controllers/uploadController.js
const exceljs = require('exceljs');
const Module = require('../models/Module');
const Student = require('../models/Student');

exports.handleFileUpload = async (req, res) => {
  try {
    const { moduleName, moduleCode, batch, academicYear, semester } = req.body;
    const markingGuideFile = req.files['markingGuide'][0];
    const studentAnswersFile = req.files['studentAnswers'][0];

    // Parse Marking Guide
    const markingGuideWorkbook = new exceljs.Workbook();
    await markingGuideWorkbook.xlsx.load(markingGuideFile.buffer);
    const markingGuideSheet = markingGuideWorkbook.worksheets[0];

    const questions = [];
    markingGuideSheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip header
        const [questionNo, question, expectedAnswer, instruction, allocatedMarks] = row.values.slice(1);
        questions.push({
          questionNo,
          question,
          expectedAnswer,
          instruction,
          allocatedMarks,
        });
      }
    });

    // Save Module Data
    const module = new Module({
      moduleName,
      moduleCode,
      batch,
      academicYear,
      semester,
      questions,
    });
    await module.save();

    // Parse Student Answers
    const studentAnswersWorkbook = new exceljs.Workbook();
    await studentAnswersWorkbook.xlsx.load(studentAnswersFile.buffer);
    const studentAnswersSheet = studentAnswersWorkbook.worksheets[0];

    const students = [];

    studentAnswersSheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip header
        const rowValues = row.values.slice(1); // Adjust for 1-based indexing
        const studentId = rowValues[0];
        const answers = [];

        for (let i = 1; i < rowValues.length; i++) {
          answers.push({
            questionNo: i,
            studentAnswer: rowValues[i] || '',
            studentMarks: 0,
            feedback: '',
          });
        }

        students.push({
          studentId,
          moduleCode,
          answers,
          totalMarks: 0,
        });
      }
    });

    // Save Student Data
    await Student.insertMany(students);

    res.status(200).json({ message: 'Files uploaded and data saved successfully.' });
  } catch (error) {
    console.error('File upload failed', error);
    res.status(500).json({ error: 'File upload failed' });
  }
};
