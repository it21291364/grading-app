const Student = require("../models/Student");
const Module = require("../models/Module");
const ExcelJS = require("exceljs");
const OpenAI = require('openai');

exports.startGrading = async (req, res) => {
  try {
    const students = await Student.find();
    const module = await Module.findOne(); // Assuming one module for simplicity

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    for (const student of students) {
      let totalMarks = 0;

      for (const answerObj of student.answers) {
        const questionObj = module.questions.find(
          (q) => q.questionNo === answerObj.questionNo
        );

        if (!questionObj) continue;

        // Updated prompt to include Instructions and other considerations
        /**
         * Generates a prompt for evaluating student responses based on conceptual correctness and completeness.
         * 
         * The prompt includes the following details:
         * - Question
         * - Expected Answer
         * - Instruction
         * - Allocated Marks
         * - Student Answer
         * 
         * The evaluation should:
         * - Consider the instructions provided in the marking guide.
         * - Ignore spelling and grammar mistakes.
         * - Award full marks if the student's answer satisfactorily addresses the question and meets the instructions.
         * 
         * The output should be in JSON format with the following structure:
         * {
         *   "Marks Awarded": <number>,
         *   "Feedback": "<feedback text>"
         * }
         * 
         * @param {Object} questionObj - The object containing question details.
         * @param {string} questionObj.question - The question text.
         * @param {string} questionObj.expectedAnswer - The expected answer text.
         * @param {string} questionObj.instruction - The instruction for grading.
         * @param {number} questionObj.allocatedMarks - The total marks allocated for the question.
         * @param {Object} answerObj - The object containing the student's answer.
         * @param {string} answerObj.studentAnswer - The student's answer text.
         * @returns {string} The generated prompt for evaluation.
         */
        const prompt = `
You are an educational assistant that evaluates student responses based on their conceptual correctness and completeness, providing a score and feedback.

When grading, please:

- **Consider the Instructions provided in the marking guide**.
- **Ignore spelling and grammar mistakes**.
- **If the student's answer satisfactorily addresses the question and meets the instructions, award full marks**.

Below are the details:

**Question**: ${questionObj.question}
**Expected Answer**: ${questionObj.expectedAnswer}
**Instruction**: ${questionObj.instruction}
**Allocated Marks**: ${questionObj.allocatedMarks}

**Student Answer**: ${answerObj.studentAnswer}

Please provide:

- **Marks Awarded**: A number between 0 and ${questionObj.allocatedMarks}.
- **Feedback**: Brief feedback explaining the reason for the assigned score.

Provide the output in the following JSON format:

{
  "Marks Awarded": <number>,
  "Feedback": "<feedback text>"
}
`;

        try {
          /**
           * Sends a prompt to the OpenAI GPT-3.5-turbo model and retrieves a completion response.
           *
           * @async
           * @function
           * @param {string} prompt - The prompt to send to the OpenAI model.
           * @returns {Promise<Object>} The response from the OpenAI model.
           */
          const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
            max_tokens: 500,
            temperature: 0,
          });

          const output = response.choices[0].message.content.trim();

          console.log('OpenAI response:', output);

          let studentMarks = 0;
          let feedback = 'No feedback provided';

          try {
            const jsonResponse = JSON.parse(output);
            studentMarks = jsonResponse['Marks Awarded'] || 0;
            feedback = jsonResponse['Feedback'] || 'No feedback provided';
          } catch (error) {
            console.error('Failed to parse OpenAI response:', error);
          }

          answerObj.studentMarks = studentMarks;
          answerObj.feedback = feedback;

          totalMarks += studentMarks;
        } catch (error) {
          if (error instanceof OpenAI.APIError) {
            console.error('API Error:', error);
          } else {
            console.error('Unexpected Error:', error);
          }
        }
      }

      student.totalMarks = totalMarks;
      await student.save();
    }

    res.status(200).json({ message: 'Grading completed successfully.' });
  } catch (error) {
    console.error('Grading failed:', error);
    res.status(500).json({ error: 'Grading failed' });
  }
};

exports.getStudentResults = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findOne({ studentId });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    /**
     * Finds a module based on the provided module code.
     *
     * @param {Object} student - The student object containing the module code.
     * @param {string} student.moduleCode - The code of the module to find.
     * @returns {Promise<Object>} The module object if found, otherwise null.
     */
    const module = await Module.findOne({ moduleCode: student.moduleCode });

    res.status(200).json({ student, module });
  } catch (error) {
    console.error("Failed to fetch student results", error);
    res.status(500).json({ error: "Failed to fetch student results" });
  }
};

exports.updateStudentResults = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { answers } = req.body;

    /**
     * Retrieves a student document from the database based on the provided student ID.
     *
     * @param {string} studentId - The ID of the student to be retrieved.
     * @returns {Promise<Object|null>} A promise that resolves to the student document if found, or null if not found.
     */
    const student = await Student.findOne({ studentId });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    student.answers = answers;
    student.totalMarks = answers.reduce(
      (sum, ans) => sum + ans.studentMarks,
      0
    );

    await student.save();

    res.status(200).json({ message: "Student data updated successfully." });
  } catch (error) {
    console.error("Failed to update student results", error);
    res.status(500).json({ error: "Failed to update student results" });
  }
};

exports.getStudentList = async (req, res) => {
  try {
    /**
     * Retrieves a list of students with only their studentId field.
     * 
     * @returns {Promise<Array<{studentId: string}>>} A promise that resolves to an array of student objects containing only the studentId field.
     */
    const students = await Student.find({}, "studentId");
    res.status(200).json({ students });
  } catch (error) {
    console.error("Failed to fetch student list", error);
    res.status(500).json({ error: "Failed to fetch student list" });
  }
};

exports.downloadResults = async (req, res) => {
  try {
    const { format } = req.params;
    const students = await Student.find();
    const module = await Module.findOne(); // Assuming one module

    if (format === "excel") {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Results");

      // Add module details at the top
      worksheet.addRow(["Module Name", module.moduleName]);
      worksheet.addRow(["Module Code", module.moduleCode]);
      worksheet.addRow(["Academic Year", module.academicYear]);
      worksheet.addRow(["Semester", module.semester]);
      worksheet.addRow(["Batch", module.batch]);
      worksheet.addRow([]); // Empty row for spacing

      // Prepare the header row
      const headerRow = [
        "Student ID",
        ...module.questions.map((q) => `Q${q.questionNo} Marks`),
        "Total Marks",
      ];

      worksheet.addRow(headerRow);

      // Add data rows
      students.forEach((student) => {
        /**
         * Constructs an array representing a student's grading information.
         *
         * @param {Object} student - The student object containing grading details.
         * @param {string} student.studentId - The ID of the student.
         * @param {Array} student.answers - An array of answer objects.
         * @param {number} student.answers[].studentMarks - The marks obtained by the student for each answer.
         * @param {number} student.totalMarks - The total marks obtained by the student.
         * @returns {Array} An array containing the student's ID, marks for each answer, and total marks.
         */
        const row = [
          student.studentId,
          ...student.answers.map((ans) => ans.studentMarks),
          student.totalMarks,
        ];
        worksheet.addRow(row);
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=results.xlsx"
      );

      await workbook.xlsx.write(res);
      res.end();
    } else if (format === "csv") {
      // Implement CSV download logic
    } else if (format === "pdf") {
      // Implement PDF download logic
    } else {
      res.status(400).json({ error: "Invalid format" });
    }
  } catch (error) {
    console.error("Failed to download results", error);
    res.status(500).json({ error: "Failed to download results" });
  }
};

exports.getAllStudentResults = async (req, res) => {
  try {
    const students = await Student.find();
    const module = await Module.findOne(); // Assuming one module

    // Prepare data to send
    /**
     * Processes an array of student objects to extract their answers and total marks.
     *
     * @param {Array} students - An array of student objects.
     * @param {Object} students[].studentId - The ID of the student.
     * @param {Array} students[].answers - An array of answer objects for the student.
     * @param {Object} students[].answers[].questionNo - The question number.
     * @param {Object} students[].answers[].studentMarks - The marks obtained by the student for the question.
     * @param {number} students[].totalMarks - The total marks obtained by the student.
     * @returns {Array} An array of objects containing studentId, answers, and totalMarks.
     */
    const results = students.map((student) => {
      const answerMarks = student.answers.map((ans) => ({
        questionNo: ans.questionNo,
        studentMarks: ans.studentMarks,
      }));

      return {
        studentId: student.studentId,
        answers: answerMarks,
        totalMarks: student.totalMarks,
      };
    });

    res.status(200).json({ results, module });
  } catch (error) {
    console.error('Failed to fetch all student results', error);
    res.status(500).json({ error: 'Failed to fetch all student results' });
  }
};


