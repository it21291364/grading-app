import React from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';

function LoadingPage() {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
            <CircularProgress />
            <Typography variant="h5" sx={{ mt: 2 }}>We Are Generating Results For You</Typography>
        </Box>
    );
}

export default LoadingPage;