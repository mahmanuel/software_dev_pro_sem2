import React, { useState } from "react";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";

const IssueForm = () => {
  const [issue, setIssue] = useState({ title: "", description: "", category: "" });
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const submitIssue = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading

    try {
      await axios.post("http://127.0.0.1:8000/api/issues/", issue, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      alert("Issue submitted successfully!");
      setIssue({ title: "", description: "", category: "" }); // Reset form
    } catch (error) {
      alert("Failed to submit issue");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <div>
      <h2>Submit an Issue</h2>
      <form onSubmit={submitIssue}>
        <input type="text" placeholder="Title" value={issue.title} onChange={(e) => setIssue({ ...issue, title: e.target.value })} required />
        <textarea placeholder="Description" value={issue.description} onChange={(e) => setIssue({ ...issue, description: e.target.value })} required></textarea>
        <input type="text" placeholder="Category" value={issue.category} onChange={(e) => setIssue({ ...issue, category: e.target.value })} required />
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} color="inherit" /> : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default IssueForm;
