"use client";

<<<<<<< HEAD
import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { getCurrentUser } from "./services/authService"
import Welcome from "./components/Welcome"
import Login from "./components/Login"
import Register from "./components/Register"
import DashboardStudent from "./components/DashboardStudent"
import DashboardRegistrar from "./components/DashboardRegistrar"
import DashboardFaculty from "./components/DashboardFaculty"
import IssueDetail from "./components/IssueDetail"
import "./styles.css"
=======
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
>>>>>>> 1bd985f633aa89c6c2965f3d23758b9c4e7f1ff3

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

<<<<<<< HEAD
  // Helper function to check if user is a student
  const isStudent = (user) => {
    return user && (user.role === "STUDENT" || user.role === "student")
  }

  // Helper function to check if user is faculty
  const isFaculty = (user) => {
    return user && (user.role === "FACULTY" || user.role === "faculty")
  }

  // Helper function to check if user is admin or registrar
  const isAdminOrRegistrar = (user) => {
    return (
      user && (user.role === "ADMIN" || user.role === "REGISTRAR" || user.role === "admin" || user.role === "registrar")
    )
  }

  if (isLoading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            user ? (
              isStudent(user) ? (
                <Navigate to="/student" />
              ) : isFaculty(user) ? (
                <Navigate to="/faculty" />
              ) : isAdminOrRegistrar(user) ? (
                <Navigate to="/registrar" />
              ) : (
                <Welcome />
              )
            ) : (
              <Welcome />
            )
          }
        />

        <Route
          path="/login"
          element={
            user ? (
              isStudent(user) ? (
                <Navigate to="/student" />
              ) : isFaculty(user) ? (
                <Navigate to="/faculty" />
              ) : isAdminOrRegistrar(user) ? (
                <Navigate to="/registrar" />
              ) : (
                <Login setUser={setUser} />
              )
            ) : (
              <Login setUser={setUser} />
            )
          }
        />

        <Route
          path="/register"
          element={
            user ? (
              isStudent(user) ? (
                <Navigate to="/student" />
              ) : isFaculty(user) ? (
                <Navigate to="/faculty" />
              ) : isAdminOrRegistrar(user) ? (
                <Navigate to="/registrar" />
              ) : (
                <Register setUser={setUser} />
              )
            ) : (
              <Register setUser={setUser} />
            )
          }
        />

        {/* Protected student routes */}
        <Route
          path="/student"
          element={isStudent(user) ? <DashboardStudent setUser={setUser} /> : <Navigate to="/login" />}
        />

        {/* Protected faculty routes */}
        <Route
          path="/faculty"
          element={isFaculty(user) ? <DashboardFaculty setUser={setUser} /> : <Navigate to="/login" />}
        />

        {/* Protected admin/registrar routes */}
        <Route
          path="/registrar"
          element={isAdminOrRegistrar(user) ? <DashboardRegistrar setUser={setUser} /> : <Navigate to="/login" />}
        />

        {/* Issue detail route - accessible to all authenticated users */}
        <Route path="/issues/:issueId" element={user ? <IssueDetail /> : <Navigate to="/login" />} />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App
=======
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
>>>>>>> 1bd985f633aa89c6c2965f3d23758b9c4e7f1ff3
