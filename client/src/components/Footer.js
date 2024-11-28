import React from 'react';
import { Box, Typography } from '@mui/material';

function Footer() {
    return (
        <Box sx={{ mt: 8, py: 3, bgcolor: 'black', color: 'white', textAlign: 'center' }}>
            <Typography variant="body2">&copy; 2024 SLIIT. All Rights Reserved.</Typography>
        </Box>
    );
}

export default Footer;