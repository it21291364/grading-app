import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FileUploadForm from './components/FileUploadForm';
import LoadingPage from './components/LoadingPage';
import ReviewResults from './components/ReviewResults';
import Footer from './components/Footer';

function App() {
    const [loading, setLoading] = useState(false);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<FileUploadForm onLoading={setLoading} />} />
                {loading && <Route path="/loading" element={<LoadingPage />} />}
                <Route path="/review" element={<ReviewResults />} />
            </Routes>
            <Footer />
        </Router>
    );
}

export default App;