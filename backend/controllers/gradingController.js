// controllers/gradingController.js
const Student = require('../models/Student');
const Module = require('../models/Module');
const { Configuration, OpenAIApi } = require('openai');
const ExcelJS = require('exceljs');

exports.startGrading = async (req, res) => {
  try {
    const students = await Student.find();
    const module = await Module.findOne(); // Assuming one module for simplicity

    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    for (const student of students) {
      let totalMarks = 0;

      for (const answerObj of student.answers) {
        const questionObj = module.questions.find(q => q.questionNo === answerObj.questionNo);

        if (!questionObj) continue;

        const prompt = `
          You are an assistant that grades student answers based on the marking guide.
          Ignore spelling and grammar mistakes. Provide marks out of ${questionObj.allocatedMarks}.

          Question: ${questionObj.question}
          Expected Answer: ${questionObj.expectedAnswer}
          Instruction: ${questionObj.instruction}

          Student Answer: ${answerObj.studentAnswer}

          Provide the mark and a brief feedback.
        `;

        const response = await openai.createCompletion({
          model: 'text-davinci-003',
          prompt,
          max_tokens: 150,
          temperature: 0,
        });

        const output = response.data.choices[0].text.trim();

        // Parse the output to extract marks and feedback
        const marksMatch = output.match(/Marks Awarded: (\d+)/);
        const feedbackMatch = output.match(/Feedback: (.+)/);

        const studentMarks = marksMatch ? parseInt(marksMatch[1], 10) : 0;
        const feedback = feedbackMatch ? feedbackMatch[1] : 'No feedback provided';

        answerObj.studentMarks = studentMarks;
        answerObj.feedback = feedback;

        totalMarks += studentMarks;
      }

      student.totalMarks = totalMarks;
      await student.save();
    }

    res.status(200).json({ message: 'Grading completed successfully.' });
  } catch (error) {
    console.error('Grading failed', error);
    res.status(500).json({ error: 'Grading failed' });
  }
};

// controllers/gradingController.js
exports.getStudentResults = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findOne({ studentId });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const module = await Module.findOne({ moduleCode: student.moduleCode });

    res.status(200).json({ student, module });
  } catch (error) {
    console.error('Failed to fetch student results', error);
    res.status(500).json({ error: 'Failed to fetch student results' });
  }
};

// controllers/gradingController.js
exports.updateStudentResults = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { answers } = req.body;

    const student = await Student.findOne({ studentId });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    student.answers = answers;
    student.totalMarks = answers.reduce((sum, ans) => sum + ans.studentMarks, 0);

    await student.save();

    res.status(200).json({ message: 'Student data updated successfully.' });
  } catch (error) {
    console.error('Failed to update student results', error);
    res.status(500).json({ error: 'Failed to update student results' });
  }
};

exports.getStudentList = async (req, res) => {
  try {
    const students = await Student.find({}, 'studentId');
    res.status(200).json({ students });
  } catch (error) {
    console.error('Failed to fetch student list', error);
    res.status(500).json({ error: 'Failed to fetch student list' });
  }
};

exports.downloadResults = async (req, res) => {
  try {
    const { format } = req.params;
    const students = await Student.find();

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Results');

      worksheet.columns = [
        { header: 'Student ID', key: 'studentId', width: 15 },
        { header: 'Total Marks', key: 'totalMarks', width: 15 },
        // Add more columns as needed
      ];

      students.forEach(student => {
        worksheet.addRow({
          studentId: student.studentId,
          totalMarks: student.totalMarks,
          // Add more fields as needed
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=results.xlsx');

      await workbook.xlsx.write(res);
      res.end();
    } else if (format === 'csv') {
      // Implement CSV download logic
    } else if (format === 'pdf') {
      // Implement PDF download logic
    } else {
      res.status(400).json({ error: 'Invalid format' });
    }
  } catch (error) {
    console.error('Failed to download results', error);
    res.status(500).json({ error: 'Failed to download results' });
  }
};
