"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import api from "../services/api";
import LoadingSpinner from "./LoadingSpinner";

function IssueForm({ onIssueSubmit }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    console.log("Submitting:", formData);
    try {
      const response = await api.post("/issues/", formData); // Adjust endpoint if needed
      console.log("Response:", response.data);
      toast.success("Issue submitted successfully!");
      if (onIssueSubmit) onIssueSubmit(response.data);
      setFormData({ title: "", description: "", category: "", priority: "" });
    } catch (err) {
      console.error("Error submitting issue:", err.response || err);
      const errorMsg = err.response?.data?.detail || "Failed to submit issue.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="issue-form">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter issue title"
            required
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your issue"
            required
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            disabled={isLoading}
          >
            <option value="">Select Category</option>
            <option value="TRANSCRIPT">Transcript</option>
            <option value="REGISTRATION">Registration</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            required
            disabled={isLoading}
          >
            <option value="">Select Priority</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? <LoadingSpinner /> : "Submit Issue"}
        </button>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
}

export default IssueForm;