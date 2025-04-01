import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; 
import axios from "axios";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      console.log("Decoded token:", decoded);
      setUser(decoded);

      axios
      .get("http://127.0.0.1:8000/api/auth/profile/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setDashboardData(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data.");
        setLoading(false);
      });
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem("token");
      navigate("/");
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h2>Welcome, {dashboardData?.username || "User"}</h2>
      
      <div className="user-role-section">
        <p>Role: {dashboardData?.role}</p>
      </div>

      <div className="dashboard-actions">
        {dashboardData?.role === "Student" && (
          <button onClick={() => navigate("/issues")}>View My Issues</button>
        )}
        {dashboardData?.role === "Faculty" && (
          <button onClick={() => navigate("/issues")}>Manage Issues</button>
        )}
        {dashboardData?.role === "Admin" && (
          <button onClick={() => navigate("/admin")}>Admin Panel</button>
        )}
      </div>

      <div className="extra-info">
        <h3>Dashboard Overview</h3>
        <ul>
          <li>Total Issues: {dashboardData?.total_issues}</li>
          <li>Pending Issues: {dashboardData?.pending_issues}</li>
          <li>Resolved Issues: {dashboardData?.resolved_issues}</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
