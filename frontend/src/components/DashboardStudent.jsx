"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { getUserIssues } from "../services/issueService";
import { logout } from "../services/authService";
import {
  fetchIssuesStart,
  fetchIssuesSuccess,
  fetchIssuesFailure,
} from "../slices/issuesSlice";
import { STATUS_LABELS } from "../constants/issueConstants";
import IssueForm from "./IssueForm";
import IssueList from "./IssueList";
import NotificationBell from "./NotificationBell";
import LoadingSpinner from "./LoadingSpinner";

function DashboardStudent({ setUser }) {
  const dispatch = useDispatch();
  const { list: issues, loading: isLoading, error } = useSelector(
    (state) => state.issues
  );
  const [filter, setFilter] = useState("");
  const navigate = useNavigate();

  const fetchIssues = async () => {
    dispatch(fetchIssuesStart());
    try {
      const userIssues = await getUserIssues();
      const issuesArray = userIssues.results
        ? userIssues.results
        : Array.isArray(userIssues)
        ? userIssues
        : [];
      dispatch(fetchIssuesSuccess(issuesArray));
    } catch (err) {
      console.error("Error fetching issues:", err.response?.data || err.message);
      dispatch(
        fetchIssuesFailure(
          "Failed to load issues: " + (err.response?.data?.detail || err.message)
        )
      );
      toast.error("Failed to load issues. Please try again later.");
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []); // only fetch on mount

  const handleIssueSubmit = () => {
    fetchIssues();
    toast.success("Issue submitted successfully!");
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate("/");
  };

  const userInfo = JSON.parse(localStorage.getItem("user") || "{}");

  const filteredIssues = filter
    ? issues.filter((issue) => issue.current_status === filter)
    : issues;

  return (
    <div className="dashboard student-dashboard">
      <div className="dashboard-header">
        <h1>Student Dashboard</h1>
        <div className="dashboard-actions">
          <NotificationBell />
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>

      <div className="user-info">
        <p>
          Welcome, {userInfo.first_name} {userInfo.last_name}
        </p>
      </div>

      <div className="issue-form-section">
        <h2>Submit Academic Issue</h2>
        <IssueForm onIssueSubmit={handleIssueSubmit} />
      </div>

      <div className="filter-section" style={{ marginTop: "2rem" }}>
        <label htmlFor="status-filter">Filter by Status:</label>
        <select
          id="status-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ marginLeft: "10px" }}
        >
          <option value="">All</option>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="issues-section" style={{ marginTop: "2rem" }}>
        <h2>My Issues</h2>
        <IssueList
          issues={filteredIssues}
          isLoading={isLoading}
          error={error}
          setFilter={setFilter} // NEW: to enable clickable badge filtering
        />
      </div>
    </div>
  );
}

export default DashboardStudent;
