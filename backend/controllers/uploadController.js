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
        /**
         * Destructures the values from the given row object starting from the second element.
         *
         * @param {Object} row - The row object containing the values to be destructured.
         * @param {Array} row.values - The array of values in the row object.
         * @returns {Array} An array containing the question number, question, expected answer, instruction, and allocated marks.
         */
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
    /**
     * Creates a new Module instance with the provided details.
     * 
     * @param {string} moduleName - The name of the module.
     * @param {string} moduleCode - The code of the module.
     * @param {string} batch - The batch associated with the module.
     * @param {string} academicYear - The academic year for the module.
     * @param {string} semester - The semester for the module.
     * @param {Array} questions - The list of questions for the module.
     * 
     * @returns {Module} The newly created Module instance.
     */
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
