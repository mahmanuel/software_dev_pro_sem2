// src/components/DashboardStudent.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import IssueForm from './IssueForm';

function DashboardStudent() {
  const [issues, setIssues] = useState([]);
  const navigate = useNavigate();

  const handleIssueSubmit = (newIssue) => {
    setIssues([...issues, newIssue]);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="dashboard">
      <h1>Student Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>
      <IssueForm onIssueSubmit={handleIssueSubmit} />
      <h3>My Issues</h3>
      {issues.length > 0 ? (
        <ul>
          {issues.map((issue, index) => (
            <li key={index}>
              <strong>{issue.title}</strong>: {issue.description} (Submitted: {issue.date})
            </li>
          ))}
        </ul>
      ) : (
        <p>No issues logged yet.</p>
      )}
    </div>
  );
}

export default DashboardStudent;