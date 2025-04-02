// src/components/DashboardStudent.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIssues } from '../mockData';
import IssueForm from './IssueForm';

function DashboardStudent({ setUser }) {
  const [issues, setIssues] = useState([]);
  const navigate = useNavigate();

  const fetchIssues = () => {
    const allIssues = getIssues();
    const user = JSON.parse(localStorage.getItem('user'));
    const studentIssues = allIssues.filter(issue => issue.submittedBy === user?.email);
    setIssues(studentIssues);
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleIssueSubmit = (newIssue) => {
    setIssues([...issues, newIssue]);
    fetchIssues();
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null); // Update App.js state
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