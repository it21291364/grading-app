import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import FileUploadForm from "./components/FileUploadForm";
import LoadingPage from "./components/LoadingPage";
import ReviewResults from "./components/ReviewResults";
import DownloadResults from "./components/DownloadResults";
import EditMarkingGuide from './components/EditMarkingGuide';

function App() {
  return (
    <Router>
      <Routes>
        {/* Define the route for the file upload form */}
        <Route path="/" element={<FileUploadForm />} />

        <Route path="/editMarkingGuide" element={<EditMarkingGuide />} />

        {/* Define the route for the loading page */}
        <Route path="/loading" element={<LoadingPage />} />

        {/* Define the route for reviewing results */}
        <Route path="/review" element={<ReviewResults />} />

        {/* Define the route for downloading results */}
        <Route path="/download" element={<DownloadResults />} />
      </Routes>
    </Router>
  );
}

export default App;
