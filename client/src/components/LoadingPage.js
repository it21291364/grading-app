import React from 'react';
import { Box, Typography } from '@mui/material';

function LoadingPage() {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', bgcolor: '#2A2826' }}>
            <Box
                component="img"
                src={require('../img/wavy.gif')}// Replace with the path to your loading GIF
                alt="Loading"
                sx={{ width: 1000, height: 800, mb: 3 }}
            />
            <Typography variant="h5" sx={{ color: 'white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>We Are Generating Results For You</Typography>
        </Box>
    );
}

export default LoadingPage;