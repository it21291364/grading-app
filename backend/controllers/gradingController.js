const Student = require("../models/Student");
const Module = require("../models/Module");
const ExcelJS = require("exceljs"); // Library for generating and working with Excel files
const OpenAI = require("openai"); // OpenAI library for grading using GPT

/**
 * Function to start grading students' answers.
 * Iterates through students, evaluates their answers using OpenAI, and updates marks and feedback.
 */
exports.startGrading = async (req, res) => {
  try {
    // Fetch all students and the associated module data
    const students = await Student.find(); // Retrieve all student documents
    const module = await Module.findOne(); // Retrieve a single module (assumes one module is active)

    // Initialize OpenAI API client with the API key from environment variables
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Iterate over each student
    for (const student of students) {
      let totalMarks = 0; // Initialize total marks for the student

      // Loop through each answer submitted by the student
      for (const answerObj of student.answers) {
        // Find the corresponding question from the module based on question number
        const questionObj = module.questions.find(
          (q) => q.questionNo === answerObj.questionNo
        );

        // Skip grading if the question is not found in the module
        if (!questionObj) continue;

        // Construct a prompt for OpenAI to evaluate the answer
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
          // Send grading request to OpenAI
          const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", // Use GPT-3.5-turbo for processing
            messages: [
              {
                role: "user",
                content: prompt, // Provide the constructed prompt
              },
            ],
            max_tokens: 500, // Limit the response size to prevent excessive output
            temperature: 0, // Ensure deterministic grading
          });

          // Extract and process the response from OpenAI
          const output = response.choices[0].message.content.trim();

          // Initialize variables to hold marks and feedback from OpenAI
          let studentMarks = 0;
          let feedback = "No feedback provided";

          try {
            // Parse the AI's response as JSON
            const jsonResponse = JSON.parse(output);
            studentMarks = jsonResponse["Marks Awarded"] || 0; // Extract marks or default to 0
            feedback = jsonResponse["Feedback"] || "No feedback provided"; // Extract feedback or default
          } catch (error) {
            console.error("Failed to parse OpenAI response:", error); // Log JSON parsing errors
          }

          // Update the student's answer with marks and feedback
          answerObj.studentMarks = studentMarks;
          answerObj.feedback = feedback;

          // Accumulate the student's total marks
          totalMarks += studentMarks;
        } catch (error) {
          // Log API or other unexpected errors during grading
          if (error instanceof OpenAI.APIError) {
            console.error("API Error:", error);
          } else {
            console.error("Unexpected Error:", error);
          }
        }
      }

      // Update the student's total marks in the database
      student.totalMarks = totalMarks;
      await student.save();
    }

    // Send a success response to the client
    res.status(200).json({ message: "Grading completed successfully." });
  } catch (error) {
    // Handle and log errors that occur during the grading process
    console.error("Grading failed:", error);
    res.status(500).json({ error: "Grading failed" });
  }
};

/**
 * Fetch a specific student's results, including their answers, feedback, and marks.
 */
exports.getStudentResults = async (req, res) => {
  try {
    const { studentId } = req.params; // Extract student ID from the request parameters
    const student = await Student.findOne({ studentId }); // Find the student document

    // Return 404 if the student is not found
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Fetch the module associated with the student's module code
    const module = await Module.findOne({ moduleCode: student.moduleCode });

    // Respond with the student and module data
    res.status(200).json({ student, module });
  } catch (error) {
    console.error("Failed to fetch student results", error);
    res.status(500).json({ error: "Failed to fetch student results" });
  }
};

/**
 * Update a student's results, including their answers and total marks.
 */
exports.updateStudentResults = async (req, res) => {
  try {
    const { studentId } = req.params; // Extract student ID from the request parameters
    const { answers } = req.body; // Extract updated answers from the request body

    // Find the student record in the database
    const student = await Student.findOne({ studentId });

    // Return 404 if the student is not found
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Update the student's answers and recalculate total marks
    student.answers = answers;
    student.totalMarks = answers.reduce(
      (sum, ans) => sum + ans.studentMarks,
      0
    );

    // Save the updated student data
    await student.save();

    // Respond with a success message
    res.status(200).json({ message: "Student data updated successfully." });
  } catch (error) {
    console.error("Failed to update student results", error);
    res.status(500).json({ error: "Failed to update student results" });
  }
};

/**
 * Fetch a list of all students with their IDs.
 */
exports.getStudentList = async (req, res) => {
  try {
    const students = await Student.find({}, "studentId"); // Fetch all student IDs
    res.status(200).json({ students }); // Respond with the student list
  } catch (error) {
    console.error("Failed to fetch student list", error);
    res.status(500).json({ error: "Failed to fetch student list" });
  }
};

/**
 * Download student results in the specified format (e.g., Excel, CSV, PDF).
 * Processes the results and generates a downloadable file for the client.
 */
exports.downloadResults = async (req, res) => {
  try {
    const { format } = req.params; // Extract the desired format from the request parameters
    const students = await Student.find(); // Retrieve all student records from the database
    const module = await Module.findOne(); // Retrieve the module data (assumes only one module)

    // Check the requested format and handle accordingly
    if (format === "excel") {
      const workbook = new ExcelJS.Workbook(); // Create a new Excel workbook
      const worksheet = workbook.addWorksheet("Results"); // Add a worksheet titled "Results"

      // Add module details to the top of the worksheet
      worksheet.addRow(["Module Name", module.moduleName]);
      worksheet.addRow(["Module Code", module.moduleCode]);
      worksheet.addRow(["Academic Year", module.academicYear]);
      worksheet.addRow(["Semester", module.semester]);
      worksheet.addRow(["Batch", module.batch]);
      worksheet.addRow([]); // Empty row for spacing

      // Prepare the header row for the results table
      const headerRow = [
        "Student ID", // First column is for student IDs
        ...module.questions.map((q) => `Q${q.questionNo} Marks`), // Add a column for each question's marks
        "Total Marks", // Final column is for total marks
      ];

      worksheet.addRow(headerRow); // Add the header row to the worksheet

      // Add data rows for each student
      students.forEach((student) => {
        const row = [
          student.studentId, // Add the student's ID
          ...student.answers.map((ans) => ans.studentMarks), // Add the marks for each question
          student.totalMarks, // Add the total marks
        ];
        worksheet.addRow(row);
      });

      // Set the response headers for Excel file download
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", "attachment; filename=results.xlsx");

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
    // Log and return an error response if the download process fails
    console.error("Failed to download results", error);
    res.status(500).json({ error: "Failed to download results" });
  }
};

/**
 * Fetch all student results in the module, including their answers and total marks.
 * Returns a list of all students with their question-wise marks and total scores.
 */
exports.getAllStudentResults = async (req, res) => {
  try {
    const students = await Student.find(); // Retrieve all student records from the database
    const module = await Module.findOne(); // Retrieve the module data (assumes only one module)

    // Prepare the results data to be sent in the response
    const results = students.map((student) => {
      // Map each student's answers to their respective question numbers and marks
      const answerMarks = student.answers.map((ans) => ({
        questionNo: ans.questionNo, // Question number
        studentMarks: ans.studentMarks, // Marks awarded for the question
      }));

      // Return a structured result for each student
      return {
        studentId: student.studentId, // Student ID
        answers: answerMarks, // Question-wise marks
        totalMarks: student.totalMarks, // Total marks for the student
      };
    });

    // Respond with the results and module details
    res.status(200).json({ results, module });
  } catch (error) {
    // Log and return an error response if the fetching process fails
    console.error("Failed to fetch all student results", error);
    res.status(500).json({ error: "Failed to fetch all student results" });
  }
};
