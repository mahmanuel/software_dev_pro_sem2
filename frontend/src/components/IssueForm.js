// src/components/IssueForm.js
import React, { useState } from 'react';

function IssueForm({ onIssueSubmit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const issue = { title, description, submittedBy: 'student', date: new Date().toISOString() };
    // Replace with API call (e.g., POST /issues)
    console.log('Issue submitted:', issue);
    onIssueSubmit(issue); // Pass to parent component
    setTitle('');
    setDescription('');
  };

  return (
    <div className="issue-form">
      <h3>Log an Issue</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Issue Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit">Submit Issue</button>
      </form>
    </div>
  );
}

export default IssueForm;