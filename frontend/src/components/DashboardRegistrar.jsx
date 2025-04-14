"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { getAllIssues, assignIssue, addIssueStatus } from "../services/issueService";
import { logout } from "../services/authService";
import { fetchIssuesStart, fetchIssuesSuccess, fetchIssuesFailure } from "../slices/issuesSlice";
import NotificationBell from "./NotificationBell";
import LoadingSpinner from "./LoadingSpinner";
import { STATUS_LABELS, CATEGORY_LABELS, PRIORITY_LABELS } from "../constants/issueConstants";

function DashboardRegistrar({ setUser }) {
  const dispatch = useDispatch();
  const { list: issues, loading: isLoading, error } = useSelector((state) => state.issues);
  const [filters, setFilters] = useState({ status: "", category: "", priority: "" });
  const [facultyList, setFacultyList] = useState([]);
  const navigate = useNavigate();

  const fetchIssues = async () => {
    dispatch(fetchIssuesStart());
    try {
      const activeFilters = Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== ""));
      const data = await getAllIssues(activeFilters);
      const issuesArray = data.results ? data.results : Array.isArray(data) ? data : [];
      dispatch(fetchIssuesSuccess(issuesArray));
    } catch (err) {
      console.error("Error fetching issues:", err);
      dispatch(fetchIssuesFailure("Failed to load issues."));
      toast.error("Failed to load issues. Please try again later.");
    }
  };

  const fetchFacultyList = async () => {
    setFacultyList([
      { id: 1, email: "faculty1@example.com", name: "Faculty One" },
      { id: 2, email: "faculty2@example.com", name: "Faculty Two" },
      { id: 3, email: "faculty3@example.com", name: "Faculty Three" },
    ]);
  };

  useEffect(() => {
    fetchIssues();
    fetchFacultyList();
  }, [filters, dispatch]);

  const handleAssignIssue = async (issueId, facultyId) => {
    try {
      await assignIssue(issueId, facultyId);
      toast.success("Issue assigned successfully!");
      fetchIssues();
    } catch (err) {
      console.error("Error assigning issue:", err);
      toast.error("Failed to assign issue.");
    }
  };

  const handleStatusChange = async (issueId, newStatus) => {
    try {
      await addIssueStatus(issueId, { status: newStatus, notes: `Status updated to ${newStatus}` });
      toast.success("Status updated successfully!");
      fetchIssues();
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status.");
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate("/");
  };

  const handleNotificationClick = (notification) => {
    if (notification.content_type === "issues.issue" && notification.object_id) {
      navigate(`/issues/${notification.object_id}`);
    } else if (notification.viewAll) {
      alert("View all notifications clicked");
    }
  };

  const userInfo = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = userInfo.role.toUpperCase() === "ADMIN";

  return (
    <div className="dashboard registrar-dashboard">
      <div className="dashboard-header">
        <h1>{isAdmin ? "Admin" : "Registrar"} Dashboard</h1>
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
        <h2>Student Issues</h2>
        <div className="filter-controls">
          <div className="filter-group">
            <label>Status:</label>
            <select name="status" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">All Statuses</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Category:</label>
            <select name="category" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
              <option value="">All Categories</option>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Priority:</label>
            <select name="priority" value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
              <option value="">All Priorities</option>
              {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : issues.length === 0 ? (
          <div className="no-issues">No issues found.</div>
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
                      value={issue.current_status || "SUBMITTED"}
                      onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                    >
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  {isAdmin && (
                    <div className="action-group">
                      <label>Assign To:</label>
                      <select
                        value={issue.assigned_to?.id || ""}
                        onChange={(e) => handleAssignIssue(issue.id, e.target.value)}
                      >
                        <option value="">Unassigned</option>
                        {facultyList.map((faculty) => (
                          <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardRegistrar;