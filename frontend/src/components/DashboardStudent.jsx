"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { getUserIssues } from "../services/issueService";
import { logout } from "../services/authService";
import { fetchIssuesStart, fetchIssuesSuccess, fetchIssuesFailure } from "../slices/issuesSlice";
import IssueForm from "./IssueForm";
import IssueList from "./IssueList";
import NotificationBell from "./NotificationBell";
import LoadingSpinner from "./LoadingSpinner";

function DashboardStudent({ setUser }) {
  const dispatch = useDispatch();
  const { list: issues, loading: isLoading, error } = useSelector((state) => state.issues);
  const [filter, setFilter] = useState("");
  const navigate = useNavigate();

  const fetchIssues = async () => {
    dispatch(fetchIssuesStart());
    try {
      const userIssues = await getUserIssues();
      console.log("User Issues:", userIssues);
      const issuesArray = userIssues.results ? userIssues.results : Array.isArray(userIssues) ? userIssues : [];
      dispatch(fetchIssuesSuccess(issuesArray));
    } catch (err) {
      console.error("Error fetching issues:", err.response?.data || err.message);
      dispatch(fetchIssuesFailure("Failed to load issues: " + (err.response?.data?.detail || err.message)));
      toast.error("Failed to load issues. Please try again later.");
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [filter, dispatch]);

  const handleIssueSubmit = (newIssue) => {
    fetchIssues();
    toast.success("Issue submitted successfully!");
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate("/");
  };

  const userInfo = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="dashboard student-dashboard">
      <div className="dashboard-header">
        <h1>Student Dashboard</h1>
        <div className="dashboard-actions">
          <NotificationBell />
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </div>
      <div className="user-info">
        <p>Welcome, {userInfo.first_name} {userInfo.last_name}</p>
      </div>
      <div className="issue-form-section">
        <h2>Submit Academic Issue</h2>
        <IssueForm onIssueSubmit={handleIssueSubmit} />
      </div>
      <div className="issues-section">
        <h2>My Issues</h2>
        <IssueList issues={issues.filter((issue) => !filter || issue.current_status === filter)} isLoading={isLoading} error={error} />
      </div>
    </div>
  );
}

export default DashboardStudent;