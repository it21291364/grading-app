import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LoadingPage from "./LoadingPage";

// Define the ReviewResults component
const ReviewResults = () => {
  const [studentData, setStudentData] = useState(null); // State to store the current student's data
  const [moduleData, setModuleData] = useState(null); // State to store the module data
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0); // State to track the index of the current student being reviewed
  const [studentList, setStudentList] = useState([]); // State to store the list of all students

  const navigate = useNavigate(); // Hook to navigate programmatically between routes

  // Fetch the list of students when the component mounts
  useEffect(() => {
    const fetchStudentList = async () => {
      const response = await axios.get(
        "http://localhost:5000/api/grading/students" // API call to fetch the list of students
      );
      setStudentList(response.data.students); // Store the fetched student list in state
    };

    fetchStudentList(); // Call the function to fetch the student list
  }, []);

  // Fetch the current student's data whenever the student list or current index changes
  useEffect(() => {
    if (studentList.length > 0) {
      fetchStudentData(studentList[currentStudentIndex].studentId); // Fetch data for the student at the current index
    }
  }, [studentList, currentStudentIndex]); // Re-run this effect whenever studentList or currentStudentIndex changes

  // Function to fetch data for a specific student
  const fetchStudentData = async (studentId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/grading/student/${studentId}` // API call to fetch a specific student's data
      );
      setStudentData(response.data.student); // Store the fetched student data in state
      setModuleData(response.data.module); // Store the fetched module data in state
    } catch (error) {
      console.error("Failed to fetch student data", error);
    }
  };

  // Handle manual changes to a student's marks
  const handleMarksChange = (index, value) => {
    const updatedAnswers = [...studentData.answers]; // Create a copy of the answers array
    updatedAnswers[index].studentMarks = parseInt(value, 10); // Update the marks for the specified question
    setStudentData({ ...studentData, answers: updatedAnswers }); // Update the state with the modified answers
  };

  // Handle submission of updated marks and move to the next student
  const handleSubmit = async () => {
    try {
      // Send the updated answers to the backend
      await axios.post(
        `http://localhost:5000/api/grading/student/${studentData.studentId}`, // API endpoint for updating student data
        {
          answers: studentData.answers, // Send the updated answers
        }
      );

      // Move to the next student if there are more students to review
      if (currentStudentIndex < studentList.length - 1) {
        setCurrentStudentIndex(currentStudentIndex + 1); // Increment the index
      } else {
        // All students reviewed, navigate to the download results page
        navigate("/download");
      }
    } catch (error) {
      console.error("Failed to update student data", error);
    }
  };

  // Show a loading page if student or module data is not yet available
  if (!studentData || !moduleData) {
    return <LoadingPage />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Display student details */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <TextField
          label="Student ID"
          value={studentData.studentId}
          InputProps={{ readOnly: true }}
          variant="outlined"
        />
        <TextField
          label="Total Marks"
          value={studentData.totalMarks}
          InputProps={{ readOnly: true }}
          variant="outlined"
        />
      </Box>

      {/* Table to display and edit student answers */}
      <TableContainer component={Paper}>
        <Table aria-label="student results table">
          <TableHead>
            <TableRow>
              <TableCell>Question No</TableCell>
              <TableCell>Question</TableCell>
              <TableCell>Answer</TableCell>
              <TableCell>Allocated Marks</TableCell>
              <TableCell>Student Answer</TableCell>
              <TableCell>Student Marks</TableCell>
              <TableCell>Feedback</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Map over the student's answers and display them in the table */}
            {studentData.answers.map((answer, index) => {
              // Find the corresponding question in the module
              const question = moduleData.questions.find(
                (q) => q.questionNo === answer.questionNo
              );
              return (
                <TableRow key={index}>
                  <TableCell>{question.questionNo}</TableCell>
                  <TableCell>{question.question}</TableCell>
                  <TableCell>{question.expectedAnswer}</TableCell>
                  <TableCell>{question.allocatedMarks}</TableCell>
                  <TableCell>{answer.studentAnswer}</TableCell>
                  <TableCell>
                    {/* Editable input for student marks */}
                    <TextField
                      type="number"
                      value={answer.studentMarks}
                      onChange={(e) => handleMarksChange(index, e.target.value)}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{answer.feedback}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Submit & Next button */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        sx={{ mt: 3, float: "right" }}
        endIcon={<EditIcon />}
      >
        Submit & Next
      </Button>
    </Container>
  );
};

export default ReviewResults;
