// DownloadResults.js
import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import axios from 'axios';

function DownloadResults() {
  const handleDownload = async (format) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/grading/download/${format}`, {
        responseType: 'blob',
      });

      // Create a URL for the file
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Create a link and click it to start the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `results.${format === 'excel' ? 'xlsx' : format}`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Download failed', error);
    }
  };

  return (
    <Box sx={{ mt: 4, p: 3, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>Downloading Files</Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Please choose a format to download the student results.
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button variant="contained" onClick={() => handleDownload('csv')} sx={{ bgcolor: '#404040' }}>
          CSV
        </Button>
        <Button variant="contained" onClick={() => handleDownload('excel')} sx={{ bgcolor: '#404040' }}>
          Excel
        </Button>
        <Button variant="contained" onClick={() => handleDownload('pdf')} sx={{ bgcolor: '#404040' }}>
          PDF
        </Button>
      </Box>
    </Box>
  );
}

export default DownloadResults;
