import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  IconButton,
  Tooltip,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import LoadingIndicator from "./LoadingIndicator";

function DownloadResults() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [moduleInfo, setModuleInfo] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const moduleId = localStorage.getItem("moduleId");
        const response = await axios.get(
          `http://localhost:5000/api/grading/students/results/${moduleId}`
        );
        setResults(response.data.results);
        setModuleInfo(response.data.module);
      } catch (error) {
        console.error("Failed to fetch results", error);
      }
    };
    fetchResults();
  }, []);

  if (!moduleInfo || results.length === 0) {
    return <LoadingIndicator />;
  }

  const handleDownload = async (format) => {
    try {
      const moduleId = localStorage.getItem("moduleId");
      const response = await axios.get(
        `http://localhost:5000/api/grading/download/${moduleId}/${format}`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Build the file name using module info
      const fileExtension = format === "excel" ? "xlsx" : "pdf";
      const fileName = `${moduleInfo.moduleName}_${moduleInfo.moduleCode}_${moduleInfo.academicYear}_${moduleInfo.semester}_${moduleInfo.batch}.${fileExtension}`;

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Download failed", error);
    }
  };

  return (
    <Box sx={{ mt: 4, p: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Tooltip title="Home">
          <IconButton onClick={() => navigate("/")} color="primary" sx={{ mr: 2, fontSize: 40 }}>
            <HomeIcon sx={{ fontSize: 40 }} />
          </IconButton>
        </Tooltip>
        <Typography variant="h4" gutterBottom sx={{ flexGrow: 1, textAlign: "center" }}>
          Results Summary
        </Typography>
      </Box>

      {moduleInfo && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1">
            Module Name: {moduleInfo.moduleName}
          </Typography>
          <Typography variant="body1">Module Code: {moduleInfo.moduleCode}</Typography>
          <Typography variant="body1">Academic Year: {moduleInfo.academicYear}</Typography>
          <Typography variant="body1">Semester: {moduleInfo.semester}</Typography>
          <Typography variant="body1">Batch: {moduleInfo.batch}</Typography>
        </Box>
      )}

      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student ID</TableCell>
              {moduleInfo &&
                moduleInfo.questions.map((question) => (
                  <TableCell key={question.questionNo}>
                    Q{question.questionNo} Marks
                  </TableCell>
                ))}
              <TableCell>Total Marks</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map((student) => (
              <TableRow key={student.studentId}>
                <TableCell>{student.studentId}</TableCell>
                {moduleInfo &&
                  moduleInfo.questions.map((question) => {
                    const answer = student.answers.find(
                      (ans) => ans.questionNo === question.questionNo
                    );
                    return (
                      <TableCell key={question.questionNo}>
                        {answer ? answer.studentMarks : "N/A"}
                      </TableCell>
                    );
                  })}
                <TableCell>{student.totalMarks}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h5" gutterBottom sx={{ textAlign: "center" }}>
        Download Results
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, textAlign: "center" }}>
        Please choose a format to download the student results.
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
        {/* Removed CSV button */}
        <Button
          variant="contained"
          onClick={() => handleDownload("excel")}
          sx={{ bgcolor: "#404040" }}
        >
          XLSX
        </Button>
        <Button
          variant="contained"
          onClick={() => handleDownload("pdf")}
          sx={{ bgcolor: "#404040" }}
        >
          PDF
        </Button>
      </Box>
    </Box>
  );
}

export default DownloadResults;
