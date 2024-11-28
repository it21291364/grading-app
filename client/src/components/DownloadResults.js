import React from 'react';
import { Box, Button, Typography } from '@mui/material';

function DownloadResults() {
    const handleDownload = (format) => {
        // Implement the download logic here
        console.log(`Downloading in ${format} format`);
    };

    return (
        <Box sx={{ mt: 4, p: 3, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>Downloading Files</Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
                Please choose a format to download the student results.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button variant="contained" onClick={() => handleDownload('CSV')} sx={{ bgcolor: '#404040' }}>
                    CSV
                </Button>
                <Button variant="contained" onClick={() => handleDownload('Excel')} sx={{ bgcolor: '#404040' }}>
                    Excel
                </Button>
                <Button variant="contained" onClick={() => handleDownload('PDF')} sx={{ bgcolor: '#404040' }}>
                    PDF
                </Button>
            </Box>
        </Box>
    );
}

export default DownloadResults;