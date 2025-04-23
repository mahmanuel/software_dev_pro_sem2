"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import LoadingSpinner from "./LoadingSpinner";

function AnalyticsDashboard() {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [issueTrends, setIssueTrends] = useState([]);
  const [userActivity, setUserActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState(30);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const statsResponse = await api.get("/analytics/analytics/dashboard_stats/");
      setDashboardStats(statsResponse.data);

      const trendsResponse = await api.get(`/analytics/analytics/issue_trends/?days=${timeRange}`);
      setIssueTrends(trendsResponse.data);

      const activityResponse = await api.get(`/analytics/analytics/user_activity/?days=${timeRange}`);
      setUserActivity(activityResponse.data);

      setError("");
    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setError("Failed to load analytics data.");
      toast.error("Failed to load analytics data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      SUBMITTED: "#3498db",
      ASSIGNED: "#f39c12",
      IN_PROGRESS: "#e74c3c",
      RESOLVED: "#2ecc71",
      CLOSED: "#95a5a6",
    };
    return colors[status] || "#777";
  };

  const getMaxValue = (data, key) => Math.max(...data.map((item) => item[key]), 1);

  const getBarHeight = (value, maxValue) => `${(value / maxValue) * 100}%`;

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <h1>Analytics Dashboard</h1>
        <div className="time-range-selector">
          <label>Time Range:</label>
          <select value={timeRange} onChange={(e) => setTimeRange(Number(e.target.value))}>
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>
        </div>
      </div>

      {dashboardStats && (
        <div className="stats-overview">
          <div className="stat-card">
            <h3>Total Issues</h3>
            <div className="stat-value">{dashboardStats.total_issues}</div>
          </div>
          <div className="stat-card">
            <h3>New Issues Today</h3>
            <div className="stat-value">{dashboardStats.new_issues_today}</div>
          </div>
          <div className="stat-card">
            <h3>Resolved Today</h3>
            <div className="stat-value">{dashboardStats.resolved_today}</div>
          </div>
          <div className="stat-card">
            <h3>Active Users Today</h3>
            <div className="stat-value">{dashboardStats.active_users_today}</div>
          </div>
        </div>
      )}

      <div className="analytics-section">
        <h2>Issue Trends</h2>
        <div className="trend-chart">
          <div className="trend-legend">
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: "#4a00e0" }}></div>
              New Issues
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: "#2ecc71" }}></div>
              Resolved Issues
            </div>
          </div>
          <div className="trend-chart-container">
            {issueTrends.map((day, index) => (
              <div key={index} className="trend-day">
                <div className="trend-bars">
                  <div
                    className="trend-bar new-issues"
                    style={{ height: getBarHeight(day.new_issues, getMaxValue(issueTrends, "new_issues")) }}
                  >
                    {day.new_issues > 0 && <div className="trend-value">{day.new_issues}</div>}
                  </div>
                  <div
                    className="trend-bar resolved-issues"
                    style={{ height: getBarHeight(day.resolved_issues, getMaxValue(issueTrends, "resolved_issues")) }}
                  >
                    {day.resolved_issues > 0 && <div className="trend-value">{day.resolved_issues}</div>}
                  </div>
                </div>
                <div className="trend-date">{new Date(day.date).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="analytics-section">
        <h2>User Activity</h2>
        <div className="user-activity-chart">
          <div className="activity-legend">
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: "#3498db" }}></div>
              Active Users
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: "#e74c3c" }}></div>
              Logins
            </div>
          </div>
          <div className="activity-chart-container">
            {userActivity.map((day, index) => (
              <div key={index} className="activity-day">
                <div className="activity-bars">
                  <div
                    className="activity-bar active-users"
                    style={{ height: getBarHeight(day.active_users, getMaxValue(userActivity, "active_users")) }}
                  >
                    {day.active_users > 0 && <div className="activity-value">{day.active_users}</div>}
                  </div>
                  <div
                    className="activity-bar logins"
                    style={{ height: getBarHeight(day.logins, getMaxValue(userActivity, "logins")) }}
                  >
                    {day.logins > 0 && <div className="activity-value">{day.logins}</div>}
                  </div>
                </div>
                <div className="activity-date">{new Date(day.date).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;