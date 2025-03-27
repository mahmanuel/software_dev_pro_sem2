import React, { useState } from 'react';

const IssueResolution = ({ issues, onUpdateStatus }) => {
  const [selectedIssue, setSelectedIssue] = useState(null);

  const handleResolve = (issueId) => {
    const updatedStatus = 'Resolved'; // Example status change
    onUpdateStatus(issueId, updatedStatus);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-blue-600">Issue Resolution</h2>
      <ul>
        {issues.map((issue) => (
          <li key={issue.id} className="mb-4">
            <h3 className="text-lg font-semibold">{issue.title}</h3>
            <p>{issue.description}</p>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => handleResolve(issue.id)}
            >
              Resolve
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IssueResolution;
