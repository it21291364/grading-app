const Student = require("../models/Student");
const Module = require("../models/Module");
const ExcelJS = require("exceljs"); // Library for generating and working with Excel files
const OpenAI = require("openai"); // OpenAI library for grading using GPT
const PDFDocument = require("pdfkit");
const path = require("path");
/**
 * Function to start grading students' answers.
 * Iterates through students, evaluates their answers using OpenAI, and updates marks and feedback.
 */
exports.startGrading = async (req, res) => {
  try {
    const { moduleId } = req.params;

    const students = await Student.find({ moduleId });
    const module = await Module.findById(moduleId);

    if (!module) {
      return res.status(404).json({ error: "Module not found" });
    }

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

        const instructionLower = questionObj.instruction.toLowerCase();

        if (instructionLower.includes("give full marks")) {
          // Assign full marks directly
          answerObj.studentMarks = questionObj.allocatedMarks;
          answerObj.feedback =
            "As per the marking guide, full marks are awarded.";

          // Accumulate the student's total marks
          totalMarks += answerObj.studentMarks;

          continue; // Skip AI evaluation for this question
        }

        // Construct a prompt for OpenAI to evaluate the answer
        const prompt = `
        You are an educational assistant that strictly follows the instructions provided in the marking guide when grading student answers.
        
        **Important Instructions (Highest Priority):**
        
        - ${questionObj.instruction}
        
        **Note:**
        
        - Always prioritize the marking guide instructions above all else.
        - When grading, compare the student's answer with the expected answer provided.
        - If the student's answer does not address the question, is irrelevant, or indicates they do not know the answer (e.g., "I don't know"), award 0 marks.

        **Question Details:**
        
        - **Question**: ${questionObj.question}
        - **Expected Answer**: ${questionObj.expectedAnswer}
        - **Allocated Marks**: ${questionObj.allocatedMarks}
        
        **Student's Answer:**
        
        ${answerObj.studentAnswer}
        
        **Guidelines (Secondary Priority):**
        
        - Ignore spelling and grammar mistakes.
        - Focus on the content and accuracy of the student's answer.
        - Provide constructive feedback explaining the reason for the assigned score.
        
        **Response Format:**
        
        Provide your response in the following JSON format:
        
        {
          "Marks Awarded": <number between 0 and ${questionObj.allocatedMarks}>,
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
    const { studentId, moduleId } = req.params; // Extract student ID from the request parameters
    const student = await Student.findOne({ studentId, moduleId }); // Find the student document

    // Return 404 if the student is not found
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const module = await Module.findById(moduleId);

    if (!module) {
      return res.status(404).json({ error: "Module not found" });
    }

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
    const { studentId, moduleId } = req.params; // Extract student ID from the request parameters
    const { answers } = req.body; // Extract updated answers from the request body

    // Find the student record in the database
    const student = await Student.findOne({ studentId, moduleId });

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
    const { moduleId } = req.params; // Extract module ID from the request parameters
    const students = await Student.find({ moduleId }, "studentId"); // Fetch all student IDs
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
    const { format, moduleId } = req.params;
    const students = await Student.find({ moduleId });
    const module = await Module.findById(moduleId);

    if (!module) {
      return res.status(404).json({ error: "Module not found" });
    }

    // Updated fileName as per your request
    const fileName = `${module.moduleName}_${module.moduleCode}_${module.academicYear}_${module.semester}_${module.batch}`;

    if (format === "excel") {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Results");

      // Module details
      worksheet.addRow(["Module Name", module.moduleName]);
      worksheet.addRow(["Module Code", module.moduleCode]);
      worksheet.addRow(["Academic Year", module.academicYear]);
      worksheet.addRow(["Semester", module.semester]);
      worksheet.addRow(["Batch", module.batch]);
      worksheet.addRow([]);

      const headerRow = [
        "Student ID",
        ...module.questions.map((q) => `Q${q.questionNo} Marks`),
        "Total Marks",
      ];

      const header = worksheet.addRow(headerRow);
      header.font = { bold: true };

      students.forEach((student) => {
        const row = [
          student.studentId,
          ...module.questions.map((q) => {
            const answer = student.answers.find(
              (ans) => ans.questionNo === q.questionNo
            );
            return answer ? answer.studentMarks : "N/A";
          }),
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
        `attachment; filename="${fileName}.xlsx"`
      );

      await workbook.xlsx.write(res);
      res.end();
    } else if (format === "pdf") {
      const doc = new PDFDocument({
        margin: 50,
        size: "A4",
      });

      // Set headers for PDF
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}.pdf"`);

      // Pipe PDF data to response
      doc.pipe(res);

      // Module details
      doc.font("Helvetica-Bold").fontSize(14).text("Module Details", { underline: true });
      doc.moveDown();
      doc.font("Helvetica").fontSize(12).text(`Module Name: ${module.moduleName}`);
      doc.text(`Module Code: ${module.moduleCode}`);
      doc.text(`Academic Year: ${module.academicYear}`);
      doc.text(`Semester: ${module.semester}`);
      doc.text(`Batch: ${module.batch}`);
      doc.moveDown(2);

      // Prepare table headers
      const headers = [
        { label: "Student ID", width: 100 },
        ...module.questions.map((q) => ({ label: `Q${q.questionNo}`, width: 50 })),
        { label: "Total Marks", width: 80 },
      ];

      const tableX = doc.x;
      let tableY = doc.y;

      // Set stroke and line width once
      doc.strokeColor("black").lineWidth(1);

      // Draw header row
      doc.font("Helvetica-Bold");
      let currentX = tableX;
      let currentY = tableY;
      const headerHeight = 20;

      headers.forEach((header) => {
        doc.rect(currentX, currentY, header.width, headerHeight).stroke();
        doc.text(header.label, currentX + 5, currentY + 5, { width: header.width - 10, align: 'left' });
        currentX += header.width;
      });

      currentY += headerHeight;
      doc.font("Helvetica");

      // Draw table rows
      students.forEach((student) => {
        let rowX = tableX;
        const rowHeight = 20;

        const rowData = [
          student.studentId,
          ...module.questions.map((q) => {
            const answer = student.answers.find((ans) => ans.questionNo === q.questionNo);
            return answer ? answer.studentMarks : "N/A";
          }),
          student.totalMarks,
        ];

        rowData.forEach((data, i) => {
          const colWidth = headers[i].width;
          // Draw cell border
          doc.rect(rowX, currentY, colWidth, rowHeight).stroke();
          // Write cell text
          doc.text(`${data}`, rowX + 5, currentY + 5, { width: colWidth - 10, align: 'left' });
          rowX += colWidth;
        });

        currentY += rowHeight;
      });

      doc.end();
    } else {
      res.status(400).json({ error: "Invalid format" });
    }
  } catch (error) {
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
    const { moduleId } = req.params; // Extract module ID from the request parameters
    const students = await Student.find({ moduleId }); // Retrieve all student records from the database
    const module = await Module.findById(moduleId); // Retrieve the module data (assumes only one module)

    if (!module) {
      return res.status(404).json({ error: "Module not found" });
    }

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
