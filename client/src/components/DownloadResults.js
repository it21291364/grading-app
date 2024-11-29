// DownloadResults.js
import React from 'react';
import { Box, Button, Typography, IconButton, Tooltip } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import HomeIcon from '@mui/icons-material/Home';

function DownloadResults() {
  const navigate = useNavigate();
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
    <Box sx={{ mt: 4, p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Tooltip title="Home">
          <IconButton onClick={() => navigate('/')} color="primary" sx={{ mr: 2, fontSize: 40 }}>
            <HomeIcon sx={{ fontSize: 40 }} />
          </IconButton>
        </Tooltip>
        <Typography variant="h4" gutterBottom sx={{ flexGrow: 1, textAlign: 'center' }}>Downloading Files</Typography>
      </Box>
      <Typography variant="body1" sx={{ mb: 4, textAlign: 'center' }}>
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
