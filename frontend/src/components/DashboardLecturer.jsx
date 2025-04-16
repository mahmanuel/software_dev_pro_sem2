"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { getUserIssues, addIssueStatus } from "../services/issueService";
import { logout } from "../services/authService";
import { fetchIssuesStart, fetchIssuesSuccess, fetchIssuesFailure } from "../slices/issuesSlice";
import NotificationBell from "./NotificationBell";
import LoadingSpinner from "./LoadingSpinner";
import { STATUS_LABELS } from "../constants/issueConstants";

function DashboardLecturer({ setUser }) {
  const dispatch = useDispatch();
  const { list: issues, loading: isLoading, error } = useSelector((state) => state.issues);
  const navigate = useNavigate();

  // Fetch assigned issues for the lecturer
  const fetchIssues = async () => {
    dispatch(fetchIssuesStart());
    try {
      const userIssues = await getUserIssues(); // Assuming this fetches issues assigned to the lecturer
      const issuesArray = userIssues.results ? userIssues.results : Array.isArray(userIssues) ? userIssues : [];
      dispatch(fetchIssuesSuccess(issuesArray));
    } catch (err) {
      console.error("Error fetching issues:", err);
      dispatch(fetchIssuesFailure("Failed to load issues."));
      toast.error("Failed to load issues. Please try again later.");
    }
  };

  // Call fetchIssues when the component mounts
  useEffect(() => {
    fetchIssues();
  }, [dispatch]);

  // Handle status update when the lecturer solves the issue
  const handleStatusChange = async (issueId, newStatus) => {
    try {
      await addIssueStatus(issueId, { status: newStatus, notes: `Status updated to ${newStatus}` });
      toast.success("Status updated successfully!");
      fetchIssues(); // Re-fetch issues to update the list
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status.");
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setUser(null);
    navigate("/"); // Redirect to the home page
  };

  // Handle notification click (if notifications are integrated)
  const handleNotificationClick = (notification) => {
    if (notification.content_type === "issues.issue" && notification.object_id) {
      navigate(`/issues/${notification.object_id}`);
    } else if (notification.viewAll) {
      alert("View all notifications clicked");
    }
  };

  const userInfo = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="dashboard lecturer-dashboard">
      <div className="dashboard-header">
        <h1>Lecturer Dashboard</h1>
        <div className="dashboard-actions">
          <NotificationBell onNotificationClick={handleNotificationClick} />
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </div>

      <div className="user-info">
        <p>Welcome, {userInfo.first_name} {userInfo.last_name}</p>
        <p>Email: {userInfo.email}</p>
        <p>Role: {userInfo.role}</p>
      </div>

      <div className="issues-section">
        <h2>Assigned Issues</h2>
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : issues.length === 0 ? (
          <div className="no-issues">No assigned issues found.</div>
        ) : (
          <div className="issue-list">
            {issues.map((issue) => (
              <div key={issue.id} className="issue-card">
                <h3><a href={`/issues/${issue.id}`}>{issue.title}</a></h3>
                <p>{issue.description.substring(0, 150)}...</p>
                <div className="issue-actions">
                  <div className="action-group">
                    <label>Status:</label>
                    <select
                      value={issue.current_status || "ASSIGNED"}
                      onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                    >
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="action-group">
                    <button
                      className="resolve-button"
                      onClick={() => handleStatusChange(issue.id, "RESOLVED")}
                    >
                      Mark as Resolved
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardLecturer;
