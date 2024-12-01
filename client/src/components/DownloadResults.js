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

// Component to display and download student results
function DownloadResults() {
  const navigate = useNavigate(); // Hook to navigate between pages
  const [results, setResults] = useState([]); // State to store student results
  const [moduleInfo, setModuleInfo] = useState(null); // State to store module information

  // Fetch results and module information when the component loads
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const moduleId = localStorage.getItem('moduleId');
        const response = await axios.get(
          `http://localhost:5000/api/grading/students/results/${moduleId}`
        );
        setResults(response.data.results);
        setModuleInfo(response.data.module);
      } catch (error) {
        console.error('Failed to fetch results', error);
      }
    };

    fetchResults(); // Call the function to fetch data
  }, []); // Empty dependency array ensures this runs only once

  // Add a loading state check
  if (!moduleInfo || results.length === 0) {
    return <LoadingIndicator />;
  }
  
  // Function to handle downloading results in different formats
  const handleDownload = async (format) => {
    try {
      const moduleId = localStorage.getItem('moduleId');
      const response = await axios.get(
        `http://localhost:5000/api/grading/download/${moduleId}/${format}`,
        {
          responseType: "blob", // Ensure the response is treated as a file blob
        }
      );

      // Create a URL for the downloaded file
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Create a link and click it to start the download
      const link = document.createElement("a"); // Create a download link element
      link.href = url;
      link.setAttribute(
        "download",
        `results.${format === "excel" ? "xlsx" : format}`
      ); // Set the download file name
      document.body.appendChild(link); // Append the link to the document
      link.click(); // Trigger the download
    } catch (error) {
      console.error("Download failed", error); // Log errors if download fails
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
          {/* Home button for navigation */}
          <IconButton
            onClick={() => navigate("/")}
            color="primary"
            sx={{ mr: 2, fontSize: 40 }}
          >
            <HomeIcon sx={{ fontSize: 40 }} />
          </IconButton>
        </Tooltip>
        {/* Header for the page */}
        <Typography
          variant="h4"
          gutterBottom
          sx={{ flexGrow: 1, textAlign: "center" }}
        >
          Results Summary
        </Typography>
      </Box>

      {/* Display module information if available */}
      {moduleInfo && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1">
            Module Name: {moduleInfo.moduleName}
          </Typography>
          <Typography variant="body1">
            Module Code: {moduleInfo.moduleCode}
          </Typography>
          <Typography variant="body1">
            Academic Year: {moduleInfo.academicYear}
          </Typography>
          <Typography variant="body1">
            Semester: {moduleInfo.semester}
          </Typography>
          <Typography variant="body1">Batch: {moduleInfo.batch}</Typography>
        </Box>
      )}

      {/* Table to display results */}
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student ID</TableCell>
              {/* Dynamically generate headers for each question */}
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
            {/* Map over results to create rows */}
            {results.map((student) => (
              <TableRow key={student.studentId}>
                <TableCell>{student.studentId}</TableCell>
                {moduleInfo &&
                  moduleInfo.questions.map((question) => {
                    // Find the student's answer for each question
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

      {/* Download options */}
      <Typography variant="h5" gutterBottom sx={{ textAlign: "center" }}>
        Download Results
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, textAlign: "center" }}>
        Please choose a format to download the student results.
      </Typography>
      {/* Buttons for each file format */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
        <Button
          variant="contained"
          onClick={() => handleDownload("csv")}
          sx={{ bgcolor: "#404040" }}
        >
          CSV
        </Button>
        <Button
          variant="contained"
          onClick={() => handleDownload("excel")}
          sx={{ bgcolor: "#404040" }}
        >
          Excel
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
