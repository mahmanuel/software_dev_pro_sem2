import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Importing components from the components folder
import IssueSubmit from "./components/IssueSubmit";
import LecturerDashboard from "./components/LecturerDashboard";
import LoginPage from "./components/LoginPage";
import RegistrarDashboard from "./components/RegistrarDashboard";
import SignUpPage from "./components/SignUpPage";
import StudentDashboard from "./components/StudentDashboard";
import Welcomepage from "./components/Welcomepage"; // Importing the WelcomePage component

function App() {
  return (
    <Router>
      <Routes>
        {/* Set the WelcomePage as the first page (root route) */}
        <Route path="/" element={<Welcomepage />} />
        
        {/* Routes for Login and Sign Up */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        
        {/* Dashboard Routes */}
        <Route path="/lecturer-dashboard" element={<LecturerDashboard />} />
        <Route path="/registrar-dashboard" element={<RegistrarDashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        
        {/* Route for Issue Submission */}
        <Route path="/submit-issue" element={<IssueSubmit />} />
      </Routes>
    </Router>
  );
}

export default App;
