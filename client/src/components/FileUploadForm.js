import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Box, MenuItem, Select, InputLabel, FormControl } from '@mui/material';

function FileUploadForm({ onLoading }) {
    const [moduleName, setModuleName] = useState('');
    const [moduleCode, setModuleCode] = useState('');
    const [batch, setBatch] = useState('');
    const [academicYear, setAcademicYear] = useState('');
    const [semester, setSemester] = useState('');
    const [markingGuide, setMarkingGuide] = useState(null);
    const [markingGuideName, setMarkingGuideName] = useState('');
    const [studentAnswers, setStudentAnswers] = useState(null);
    const [studentAnswersName, setStudentAnswersName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('moduleName', moduleName);
        formData.append('moduleCode', moduleCode);
        formData.append('batch', batch);
        formData.append('academicYear', academicYear);
        formData.append('semester', semester);
        formData.append('markingGuide', markingGuide);
        formData.append('studentAnswers', studentAnswers);

        onLoading(true);
        try {
            await axios.post('http://localhost:5000/api/upload', formData);
            onLoading(false);
            // Navigate to grading results or display success message
        } catch (error) {
            console.error('File upload failed', error);
            onLoading(false);
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ mt: 4, p: 3, display: 'flex', flexDirection: 'column', maxWidth: 600, mx: 'auto' }}
        >
            <TextField label="Module Name" value={moduleName} onChange={e => setModuleName(e.target.value)} required />
            <TextField label="Module Code" value={moduleCode} onChange={e => setModuleCode(e.target.value)} required sx={{ mt: 2 }} />
            <FormControl sx={{ mt: 2 }}>
                <InputLabel>Batch</InputLabel>
                <Select value={batch} onChange={e => setBatch(e.target.value)} required>
                    <MenuItem value="Regular">Regular</MenuItem>
                    <MenuItem value="June">June</MenuItem>
                </Select>
            </FormControl>
            <FormControl sx={{ mt: 2 }}>
                <InputLabel>Academic Year</InputLabel>
                <Select value={academicYear} onChange={e => setAcademicYear(e.target.value)} required>
                    <MenuItem value="1">1</MenuItem>
                    <MenuItem value="2">2</MenuItem>
                    <MenuItem value="3">3</MenuItem>
                    <MenuItem value="4">4</MenuItem>
                </Select>
            </FormControl>
            <FormControl sx={{ mt: 2 }}>
                <InputLabel>Semester</InputLabel>
                <Select value={semester} onChange={e => setSemester(e.target.value)} required>
                    <MenuItem value="1">1</MenuItem>
                    <MenuItem value="2">2</MenuItem>
                </Select>
            </FormControl>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column' }}>
                <FormControl sx={{ mt: 2 }}>
                    <Button
                        variant="outlined"
                        component="label"
                        sx={{ textTransform: 'none', mb: 2 }}
                    >
                        Upload Marking Guide
                        <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>{markingGuideName}</span>
                        <input type="file" hidden onChange={e => { setMarkingGuide(e.target.files[0]); if (e.target.files[0]) { setMarkingGuideName(e.target.files[0].name); }}} required />
                    </Button>
                </FormControl>
                <FormControl sx={{ mt: 2 }}>
                    <Button
                        variant="outlined"
                        component="label"
                        sx={{ textTransform: 'none', mb: 2 }}
                    >
                        Upload Students' Answer Sheet
                        <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>{studentAnswersName}</span>
                        <input type="file" hidden onChange={e => { setStudentAnswers(e.target.files[0]); if (e.target.files[0]) { setStudentAnswersName(e.target.files[0].name); }}} required />
                    </Button>
                </FormControl>
            </Box>
            <Button type="submit" variant="contained" sx={{ mt: 3, backgroundColor: '#404040', transition: 'background-color 0.3s', '&:hover': { backgroundColor: '#303030' } }}>Submit</Button>
        </Box>
    );
    
}

export default FileUploadForm;