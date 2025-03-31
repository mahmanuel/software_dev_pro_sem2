import React, { useState } from 'react';

const IssueForm = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ title, description });
    setTitle('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Title</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-md"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter the issue title"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          className="w-full px-3 py-2 border rounded-md"
          rows="3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter issue details"
        ></textarea>
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
      >
        Submit
      </button>
    </form>
  );
};

export default IssueForm;
