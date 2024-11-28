import React, { useState } from 'react';
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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const ReviewResults = () => {
  const [studentData, setStudentData] = useState({
    studentId: 'IT21258953',
    totalMarks: 64,
    questions: [
      {
        questionNo: 1,
        question: 'Question Text',
        answer: 'Correct Answer',
        allocatedMarks: 10,
        studentAnswer: 'Student Answer',
        studentMarks: 5,
        feedback: 'Good attempt'
      },
      // Add more question objects as needed
    ],
  });

  const handleMarksChange = (index, value) => {
    const updatedQuestions = [...studentData.questions];
    updatedQuestions[index].studentMarks = value;
    setStudentData({ ...studentData, questions: updatedQuestions });
  };

  const handleSubmit = () => {
    // Handle submit and navigate to the next student
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
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
            {studentData.questions.map((q, index) => (
              <TableRow key={index}>
                <TableCell>{q.questionNo}</TableCell>
                <TableCell>{q.question}</TableCell>
                <TableCell>{q.answer}</TableCell>
                <TableCell>{q.allocatedMarks}</TableCell>
                <TableCell>{q.studentAnswer}</TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={q.studentMarks}
                    onChange={(e) => handleMarksChange(index, e.target.value)}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="text"
                    value={q.feedback}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
                
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        sx={{ mt: 3, float: 'right' }}
        endIcon={<EditIcon />}
      >
        Submit & Next
      </Button>
    </Container>
  );
};

export default ReviewResults;