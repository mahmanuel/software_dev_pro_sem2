// frontend/src/components/DashboardStudent.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import IssueForm from './IssueForm';

function DashboardStudent({ setUser }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/issues/student');
      setIssues(response.data);
      setError(null);
    } catch (err) {
      setError('Error fetching issues. Please try again later.');
      console.error('Error fetching issues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleIssueSubmit = (newIssue) => {
    setIssues([newIssue, ...issues]); // Add new issue at the beginning of the list
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  return (
    <div className="dashboard p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-4">Student Dashboard</h1>
      <div className="flex justify-end mb-4">
        <button
          onClick={handleLogout}
          className="
