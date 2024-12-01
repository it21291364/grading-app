import React from 'react';
import { Box, Typography } from '@mui/material';

function LoadingIndicator() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        bgcolor: '#2A2826',
      }}
    >
      <Box
        component="img"
        src={require('../img/wavy.gif')}
        alt="Loading"
        sx={{ width: 1000, height: 800, mb: 3 }}
      />
      <Typography
        variant="h5"
        sx={{
          color: 'white',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        Loading...
      </Typography>
    </Box>
  );
}

export default LoadingIndicator;
