import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, TextField, Button, Typography } from '@mui/material';

function ReviewResults() {
    const [gradedData, setGradedData] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        // Fetch graded results
        axios.get('http://localhost:5000/api/graded-results')
            .then(response => setGradedData(response.data))
            .catch(error => console.error('Error fetching graded results', error));
    }, []);

    const handleScoreChange = (questionIndex, newScore) => {
        const updatedData = [...gradedData];
        updatedData[currentIndex].questions[questionIndex].score = newScore;
        setGradedData(updatedData);
    };

    const handleSubmitNext = async () => {
        if (currentIndex < gradedData.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            // Submit final results to server
            await axios.post('http://localhost:5000/api/update-graded-results', gradedData);
        }
    };

    const currentStudent = gradedData[currentIndex];

    if (!currentStudent) return null;

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', mt: 5 }}>
            <Typography variant="h5">Student ID: {currentStudent.studentID}</Typography>
            {currentStudent.questions.map((question, index) => (
                <Box key={index} sx={{ mt: 3 }}>
                    <Typography variant="subtitle1">Question {index + 1}: {question.question}</Typography>
                    <TextField
                        label="Score"
                        type="number"
                        value={question.score}
                        onChange={(e) => handleScoreChange(index, e.target.value)}
                        sx={{ mt: 1 }}
                    />
                </Box>
            ))}
            <Button onClick={handleSubmitNext} variant="contained" color="primary" sx={{ mt: 3 }}>Submit & Next</Button>
        </Box>
    );
}

export default ReviewResults;