// frontend/src/components/DashboardStudent.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import IssueForm from './IssueForm';

function DashboardStudent({ setUser }) {
  const [issues, setIssues] = useState([]);
  const navigate = useNavigate();

  const fetchIssues = async () => {
    try {
      const response = await api.get('/api/issues/student');
      setIssues(response.data);
    } catch (err) {
      console.error('Error fetching issues:', err);
    }
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
    localStorage.removeItem('token');
    setUser(null);
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