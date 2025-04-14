"use client";

import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import store from "./store";
import { getCurrentUser } from "./services/authService";
import Welcome from "./components/Welcome";
import Login from "./components/Login";
import Register from "./components/Register";
import DashboardStudent from "./components/DashboardStudent";
import DashboardRegistrar from "./components/DashboardRegistrar";
import DashboardLecturer from "./components/DashboardLecturer";
import IssueDetail from "./components/IssueDetail";
import IssueForm from "./components/IssueForm";
import AuditTrail from "./components/AuditTrail";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import "./styles.css";

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem("token");
      if (token && !user) {
        try {
          const userProfile = await getCurrentUser();
          const userData = {
            id: userProfile.id,
            email: userProfile.email,
            role: userProfile.role,
            first_name: userProfile.first_name,
            last_name: userProfile.last_name,
          };
          localStorage.setItem("user", JSON.stringify(userData));
          setUser(userData);
        } catch (error) {
          console.error("Token verification failed:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    verifyUser();
  }, []);

  if (isLoading) return <div className="loading">Loading...</div>;

  const isStudent = user && user.role.toUpperCase() === "STUDENT";
  const isAdmin = user && user.role.toUpperCase() === "ADMIN";
  const isFaculty = user && user.role.toUpperCase() === "FACULTY";

  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={user ? <Navigate to={isStudent ? "/student" : isFaculty ? "/lecturer" : "/registrar"} /> : <Welcome />} />
          <Route path="/login" element={user ? <Navigate to={isStudent ? "/student" : isFaculty ? "/lecturer" : "/registrar"} /> : <Login setUser={setUser} />} />
          <Route path="/register" element={user ? <Navigate to={isStudent ? "/student" : isFaculty ? "/lecturer" : "/registrar"} /> : <Register setUser={setUser} />} />
          <Route path="/student" element={isStudent ? <DashboardStudent setUser={setUser} /> : <Navigate to="/login" />} />
          <Route path="/registrar" element={isAdmin ? <DashboardRegistrar setUser={setUser} /> : <Navigate to="/login" />} />
          <Route path="/lecturer" element={isFaculty ? <DashboardLecturer setUser={setUser} /> : <Navigate to="/login" />} />
          <Route path="/analytics" element={isAdmin ? <AnalyticsDashboard /> : <Navigate to="/login" />} />
          <Route path="/issues/:issueId" element={user ? <IssueDetail /> : <Navigate to="/login" />} />
          <Route path="/issues/:issueId/audit" element={user ? <AuditTrail /> : <Navigate to="/login" />} />
          <Route path="/submit-issue" element={isStudent ? <IssueForm /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </Provider>
  );
}

export default App;