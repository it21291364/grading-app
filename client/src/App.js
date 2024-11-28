import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FileUploadForm from './components/FileUploadForm';
import LoadingPage from './components/LoadingPage';
import ReviewResults from './components/ReviewResults';
import DownloadResults from './components/DownloadResults';

function App() {

    return (
        <Router>
            <Routes>
                <Route path="/" element={<FileUploadForm/>} />
                <Route path="/loading" element={<LoadingPage />} />
                <Route path="/review" element={<ReviewResults />} />
                <Route path="/download" element={<DownloadResults />} />
            </Routes>
           
        </Router>
    );
}

export default App;