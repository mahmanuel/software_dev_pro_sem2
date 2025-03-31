import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation'; // Navigation links
import AdminPage from './components/AdminPage'; // Admin page
import StudentPage from './components/StudentPage'; // Student page
import LecturerPage from './components/LecturerPage'; // Lecturer page
import IssueForm from './components/IssueForm'; // Existing IssueForm
import IssueList from './components/IssueList'; // Existing IssueList
import IssueResolution from './components/IssueResolution'; // New IssueResolution component

const App = () => {
  const mockIssues = [
    { id: 1, title: 'Test Issue 1', description: 'This is the first test issue.' },
    { id: 2, title: 'Test Issue 2', description: 'This is the second test issue.' },
  ];

  const handleCreateIssue = (newIssue) => {
    console.log('New Issue Submitted:', newIssue);
    // Add functionality here to update the list dynamically
  };

  const handleUpdateStatus = (issueId, status) => {
    console.log(`Issue ID ${issueId} status updated to ${status}`);
    // Implement functionality to update issue status
  };

  return (
    <Router>
      {/* Navigation Bar */}
      <Navigation />

      {/* Main Routing Logic */}
      <Routes>
        {/* Default Route - Issue Tracking System */}
        <Route
          path="/"
          element={
            <div className="container mx-auto py-6">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Form Section */}
                <section className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-bold text-blue-600">Submit an Issue</h2>
                  <IssueForm onSubmit={handleCreateIssue} />
                </section>

                {/* Issue List Section */}
                <section className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-bold text-blue-600">All Issues</h2>
                  <IssueList issues={mockIssues} />
                </section>

                {/* Issue Resolution Section */}
                <section className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-bold text-blue-600">Issue Resolution</h2>
                  <IssueResolution issues={mockIssues} onUpdateStatus={handleUpdateStatus} />
                </section>
              </div>
            </div>
          }
        />

        {/* Role-Specific Pages */}
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/student" element={<StudentPage />} />
        <Route path="/lecturer" element={<LecturerPage />} />
      </Routes>
    </Router>
  );
};

export default App;
