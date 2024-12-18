import React, { useState } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// Define the FileUploadForm component
function FileUploadForm({ onLoading }) {
  // Define state variables for form fields
  const [moduleName, setModuleName] = useState(""); // Module name input
  const [moduleCode, setModuleCode] = useState(""); // Module code input
  const [batch, setBatch] = useState(""); // Batch dropdown
  const [academicYear, setAcademicYear] = useState(""); // Academic year dropdown
  const [semester, setSemester] = useState(""); // Semester dropdown
  const [markingGuide, setMarkingGuide] = useState(null); // Marking guide file upload
  const [markingGuideName, setMarkingGuideName] = useState(""); // Name of the uploaded marking guide file
  const [studentAnswers, setStudentAnswers] = useState(null); // Students' answers file upload
  const [studentAnswersName, setStudentAnswersName] = useState(""); // Name of the uploaded students' answers file

  const navigate = useNavigate(); // Hook for programmatically navigating between routes

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    const formData = new FormData(); // Create a FormData object to send files and data
    // Append form data to the FormData object
    formData.append("moduleName", moduleName);
    formData.append("moduleCode", moduleCode);
    formData.append("batch", batch);
    formData.append("academicYear", academicYear);
    formData.append("semester", semester);
    formData.append("markingGuide", markingGuide); // Add marking guide file
    formData.append("studentAnswers", studentAnswers); // Add students' answers file

    try {
      const response = await axios.post(
        "http://localhost:5000/api/upload",
        formData
      );
      const moduleId = response.data.moduleId; // Get moduleId from the response
      // Store moduleId for use in other components (e.g., local storage)
      localStorage.setItem("moduleId", moduleId);
      navigate("/editMarkingGuide"); // Navigate to loading page
    } catch (error) {
      console.error("File upload failed", error);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        mt: 4,
        p: 3,
        display: "flex",
        flexDirection: "column",
        maxWidth: 600,
        mx: "auto",
      }}
    >
      {/* Input for module name */}
      <TextField
        label="Module Name"
        value={moduleName}
        onChange={(e) => setModuleName(e.target.value)}
        required
      />

      {/* Input for module code */}
      <TextField
        label="Module Code"
        value={moduleCode}
        onChange={(e) => setModuleCode(e.target.value)}
        required
        sx={{ mt: 2 }}
      />

      {/* Dropdown for selecting batch */}
      <FormControl sx={{ mt: 2 }}>
        <InputLabel>Batch</InputLabel>
        <Select
          value={batch}
          onChange={(e) => setBatch(e.target.value)}
          required
        >
          <MenuItem value="Regular">Regular</MenuItem>
          <MenuItem value="June">June</MenuItem>
        </Select>
      </FormControl>

      {/* Dropdown for selecting academic year */}
      <FormControl sx={{ mt: 2 }}>
        <InputLabel>Academic Year</InputLabel>
        <Select
          value={academicYear}
          onChange={(e) => setAcademicYear(e.target.value)}
          required
        >
          <MenuItem value="1">1</MenuItem>
          <MenuItem value="2">2</MenuItem>
          <MenuItem value="3">3</MenuItem>
          <MenuItem value="4">4</MenuItem>
        </Select>
      </FormControl>

      {/* Dropdown for selecting semester */}
      <FormControl sx={{ mt: 2 }}>
        <InputLabel>Semester</InputLabel>
        <Select
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          required
        >
          <MenuItem value="1">1</MenuItem>
          <MenuItem value="2">2</MenuItem>
        </Select>
      </FormControl>

      {/* File upload for marking guide */}
      <Box sx={{ mt: 2, display: "flex", flexDirection: "column" }}>
        <FormControl sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            component="label"
            sx={{ textTransform: "none", mb: 2 }}
          >
            Upload Marking Guide
            <span style={{ marginLeft: "10px", fontWeight: "bold" }}>
              {markingGuideName}
            </span>
            {/* Hidden input for file upload */}
            <input
              type="file"
              hidden
              onChange={(e) => {
                setMarkingGuide(e.target.files[0]);
                if (e.target.files[0]) {
                  setMarkingGuideName(e.target.files[0].name);
                }
              }}
              required
            />
          </Button>
        </FormControl>

        {/* File upload for student answers */}
        <FormControl sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            component="label"
            sx={{ textTransform: "none", mb: 2 }}
          >
            Upload Students' Answer Sheet
            <span style={{ marginLeft: "10px", fontWeight: "bold" }}>
              {studentAnswersName}
            </span>
            {/* Hidden input for file upload */}
            <input
              type="file"
              hidden
              onChange={(e) => {
                setStudentAnswers(e.target.files[0]);
                if (e.target.files[0]) {
                  setStudentAnswersName(e.target.files[0].name);
                }
              }}
              required
            />
          </Button>
        </FormControl>
      </Box>

      {/* Submit button */}
      <Button
        type="submit"
        variant="contained"
        sx={{
          mt: 3,
          backgroundColor: "#404040",
          transition: "background-color 0.3s",
          "&:hover": { backgroundColor: "#303030" },
        }}
      >
        Submit
      </Button>
    </Box>
  );
}

export default FileUploadForm;
