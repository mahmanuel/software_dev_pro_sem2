// src/components/DashboardRegistrar.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function DashboardRegistrar() {
  const [issues, setIssues] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const mockIssues = [
      { title: 'Room Issue', description: 'AC broken', submittedBy: 'student', date: '2025-03-29' },
    ];
    setIssues(mockIssues);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
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