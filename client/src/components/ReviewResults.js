// ReviewResults.js
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
import LoadingPage from './LoadingPage';

const ReviewResults = () => {
  const [studentData, setStudentData] = useState(null);
  const [moduleData, setModuleData] = useState(null);
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
  const [studentList, setStudentList] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentList = async () => {
      const response = await axios.get(
        "http://localhost:5000/api/grading/students"
      );
      setStudentList(response.data.students);
    };

    fetchStudentList();
  }, []);

  useEffect(() => {
    if (studentList.length > 0) {
      fetchStudentData(studentList[currentStudentIndex].studentId);
    }
  }, [studentList, currentStudentIndex]);

  const fetchStudentData = async (studentId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/grading/student/${studentId}`
      );
      setStudentData(response.data.student);
      setModuleData(response.data.module);
    } catch (error) {
      console.error("Failed to fetch student data", error);
    }
  };

  const handleMarksChange = (index, value) => {
    const updatedAnswers = [...studentData.answers];
    updatedAnswers[index].studentMarks = parseInt(value, 10);
    setStudentData({ ...studentData, answers: updatedAnswers });
  };

  const handleSubmit = async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/grading/student/${studentData.studentId}`,
        {
          answers: studentData.answers,
        }
      );
      // Move to next student
      if (currentStudentIndex < studentList.length - 1) {
        setCurrentStudentIndex(currentStudentIndex + 1);
      } else {
        // All students reviewed
        navigate("/download"); // Navigate to download results page
      }
    } catch (error) {
      console.error("Failed to update student data", error);
    }
  };

  if (!studentData || !moduleData) {
    return <LoadingPage />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
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
            {studentData.answers.map((answer, index) => {
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
