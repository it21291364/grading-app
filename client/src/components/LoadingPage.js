import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Define the LoadingPage component
function LoadingPage() {
  const navigate = useNavigate();
  const [gradingStarted, setGradingStarted] = useState(false);

  useEffect(() => {
    const startGrading = async () => {
      try {
        if (!gradingStarted) {
          setGradingStarted(true);
          await axios.get("http://localhost:5000/api/grading/start");
          navigate("/review");
        }
      } catch (error) {
        console.error("Grading failed", error);
      }
    };

    startGrading();
  }, [navigate, gradingStarted]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        bgcolor: "#2A2826",
      }}
    >
      {/* Display a loading animation */}
      <Box
        component="img"
        src={require("../img/wavy.gif")}
        alt="Loading"
        sx={{ width: 1000, height: 800, mb: 3 }}
      />
      {/* Display a loading message */}
      <Typography
        variant="h5"
        sx={{
          color: "white",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        We Are Generating Results For You
      </Typography>
    </Box>
  );
}

export default LoadingPage;
