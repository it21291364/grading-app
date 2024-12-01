const exceljs = require('exceljs');
const Module = require('../models/Module');
const Student = require('../models/Student');

/**
 * Function to handle file uploads for marking guides and student answers.
 * Parses the uploaded files, extracts data, and saves them to the database.
 */
exports.handleFileUpload = async (req, res) => {
  try {
    // Extract module-related data from the request body
    const { moduleName, moduleCode, batch, academicYear, semester } = req.body;
    // Retrieve the uploaded marking guide and student answers files
    const markingGuideFile = req.files['markingGuide'][0];
    const studentAnswersFile = req.files['studentAnswers'][0];

    // Load and parse the marking guide Excel file
    const markingGuideWorkbook = new exceljs.Workbook();
    await markingGuideWorkbook.xlsx.load(markingGuideFile.buffer); // Load from the uploaded file's buffer
    const markingGuideSheet = markingGuideWorkbook.worksheets[0]; // Assume the first sheet contains data

    // Initialize an array to store parsed questions
    const questions = [];
    // Iterate through rows in the marking guide sheet
    markingGuideSheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip header row
        // Extract question details from the row
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

    // Save module data to the database
    const module = new Module({
      moduleName, // Module name
      moduleCode, // Module code
      batch, // Batch information
      academicYear, // Academic year
      semester, // Semester details
      questions, // Parsed questions
    });
    const savedModule = await module.save(); // Save module and get the saved document

    // Load and parse the student answers Excel file
    const studentAnswersWorkbook = new exceljs.Workbook();
    await studentAnswersWorkbook.xlsx.load(studentAnswersFile.buffer); // Load from the uploaded file's buffer
    const studentAnswersSheet = studentAnswersWorkbook.worksheets[0]; // Assume the first sheet contains data

    const students = []; // Initialize an array to store parsed student data

    // Iterate through rows in the student answers sheet
    studentAnswersSheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip header row
        const rowValues = row.values.slice(1); // Adjust for 1-based indexing
        const studentId = rowValues[0]; // First column contains the student ID
        const answers = [];

        // Parse each answer column in the row
        for (let i = 1; i < rowValues.length; i++) {
          answers.push({
            questionNo: i, // Map each answer to a question number
            studentAnswer: rowValues[i] || '', // Default to an empty string if no answer
            studentMarks: 0, // Initialize marks as 0
            feedback: '',  // Initialize feedback as empty
          });
        }

        // Add parsed student data to the array
        students.push({
          studentId, // Student ID
          moduleCode, // Module code
          moduleId: savedModule._id, // Associate with the module ID
          answers, // Parsed answers
          totalMarks: 0, // Initialize total marks as 0
        });
      }
    });

    // Save all parsed student data to the database
    await Student.insertMany(students);

    // Respond to the client indicating successful processing and include moduleId
    res.status(200).json({
      message: 'Files uploaded and data saved successfully.',
      moduleId: savedModule._id, // Include moduleId in the response
    });
  } catch (error) {
    // Log and return an error response if processing fails
    console.error('File upload failed', error);
    res.status(500).json({ error: 'File upload failed' });
  }
};