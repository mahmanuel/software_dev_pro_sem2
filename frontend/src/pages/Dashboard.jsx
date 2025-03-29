import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; 
import axios from "axios";

const Dashboard = () => {
  const [user, setUser] = useState(null);
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
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem("token");
      navigate("/");
    }
  }, [navigate]);

  if (!user) {
    return (
      <div className="loading-container">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h2>Welcome, {user.username}</h2>
      {user.role === "Student" && <button onClick={() => navigate("/issues")}>View My Issues</button>}
      {user.role === "Faculty" && <button onClick={() => navigate("/issues")}>Manage Issues</button>}
      {user.role === "Admin" && <button onClick={() => navigate("/admin")}>Admin Panel</button>}
    </div>
  );
};

export default Dashboard;
