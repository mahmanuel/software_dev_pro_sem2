// src/components/DashboardRegistrar.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIssues } from '../mockData';

function DashboardRegistrar({ setUser }) {
  const [issues, setIssues] = useState([]);
  const navigate = useNavigate();

  const fetchIssues = () => {
    const allIssues = getIssues();
    setIssues(allIssues);
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null); // Update App.js state
    navigate('/');
  };

  return (
    <div className="dashboard">
      <h1>Registrar Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>
      <h3>All Reported Issues</h3>
      {issues.length > 0 ? (
        <ul>
          {issues.map((issue, index) => (
            <li key={index}>
              <strong>{issue.title}</strong>: {issue.description} (By: {issue.submittedBy}, {issue.date})
            </li>
          ))}
        </ul>
      ) : (
        <p>No issues reported yet.</p>
      )}
    </div>
  );
}

export default DashboardRegistrar;