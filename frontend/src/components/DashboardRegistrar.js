// frontend/src/components/DashboardRegistrar.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function DashboardRegistrar({ setUser }) {
  const [issues, setIssues] = useState([]);
  const navigate = useNavigate();

  const fetchIssues = async () => {
    try {
      const response = await api.get('/api/issues');
      setIssues(response.data);
    } catch (err) {
      console.error('Error fetching issues:', err);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
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