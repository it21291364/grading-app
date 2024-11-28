// LoadingPage.js
import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LoadingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const startGrading = async () => {
      try {
        await axios.get('http://localhost:5000/api/grading/start');
        navigate('/review'); // Navigate to the review page after grading
      } catch (error) {
        console.error('Grading failed', error);
      }
    };

    startGrading();
  }, [navigate]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', bgcolor: '#2A2826' }}>
      <Box
        component="img"
        src={require('../img/wavy.gif')}
        alt="Loading"
        sx={{ width: 1000, height: 800, mb: 3 }}
      />
      <Typography variant="h5" sx={{ color: 'white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>We Are Generating Results For You</Typography>
    </Box>
  );
}

export default LoadingPage;
