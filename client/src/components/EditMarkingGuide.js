import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LoadingIndicator from "./LoadingIndicator";

function EditMarkingGuide() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [moduleInfo, setModuleInfo] = useState(null);

  useEffect(() => {
    const moduleId = localStorage.getItem("moduleId");
    if (!moduleId) {
      alert("Module ID not found. Please upload files first.");
      navigate("/");
      return;
    }

    const fetchModule = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/module/${moduleId}`
        );
        setModuleInfo(response.data.module);
        setQuestions(response.data.module.questions);
      } catch (error) {
        console.error("Failed to fetch module details", error);
      }
    };

    fetchModule();
  }, [navigate]);

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] =
      field === "allocatedMarks" ? parseInt(value, 10) : value;
    setQuestions(updated);
  };

  const handleSubmit = async () => {
    const moduleId = localStorage.getItem("moduleId");
    try {
      await axios.put(`http://localhost:5000/api/module/${moduleId}`, {
        questions,
      });
      // After updating the marking guide, proceed to loading page to start grading
      navigate("/loading");
    } catch (error) {
      console.error("Failed to update module", error);
      alert("Failed to update module. Please try again.");
    }
  };

  if (!moduleInfo) {
    return <LoadingIndicator />;
  }

  return (
    <Box sx={{ mt: 4, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Edit Marking Guide
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Please edit the expected answer, instruction, and allocated marks as
        needed, then click "Submit" to proceed.
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Question No</TableCell>
              <TableCell>Question</TableCell>
              <TableCell>Expected Answer</TableCell>
              <TableCell>Instruction</TableCell>
              <TableCell>Allocated Marks</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {questions.map((q, index) => (
              <TableRow key={index}>
                <TableCell>{q.questionNo}</TableCell>
                <TableCell>{q.question}</TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    value={q.expectedAnswer}
                    onChange={(e) =>
                      handleQuestionChange(
                        index,
                        "expectedAnswer",
                        e.target.value
                      )
                    }
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    value={q.instruction}
                    onChange={(e) =>
                      handleQuestionChange(index, "instruction", e.target.value)
                    }
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    fullWidth
                    value={q.allocatedMarks}
                    onChange={(e) =>
                      handleQuestionChange(
                        index,
                        "allocatedMarks",
                        e.target.value
                      )
                    }
                    variant="outlined"
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
        sx={{ mt: 3, float: "right" }}
        onClick={handleSubmit}
      >
        Submit
      </Button>
    </Box>
  );
}

export default EditMarkingGuide;
