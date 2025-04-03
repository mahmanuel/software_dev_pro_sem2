// frontend/src/components/IssueForm.js
import React, { useState } from 'react';
import api from '../api';

function IssueForm({ onIssueSubmit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    const issue = {
      title,
      description,
      submittedBy: user?.email || 'student',
      date: new Date().toISOString(),
    };

    try {
      const response = await api.post('/api/issues', issue);
      onIssueSubmit(response.data);
      setTitle('');
      setDescription('');
      setError('');
      alert('Issue submitted successfully!');
    } catch (err) {
      setError('Failed to submit issue: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="issue-form">
      <h3>Submit an Issue</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Issue Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Describe the issue..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="4"
          required
        />
        <button type="submit">Submit</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}

export default IssueForm;