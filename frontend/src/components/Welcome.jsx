"use client"
import { useNavigate } from "react-router-dom"

function Welcome() {
  const navigate = useNavigate()

  const handleRoleRegistration = (role) => {
    navigate(`/register?role=${role}`)  // Pass role as a query parameter
  }

  return (
    <div className="welcome-page">
      {/* Header */}
      <header className="header">
        <div className="logo">AITS</div>
        <div className="auth-buttons">
          <button onClick={() => navigate("/login")}>Login</button>
          <button onClick={() => navigate("/register")}>Register</button>
        </div>
      </header>

      {/* Main Section */}
      <section className="intro-section">
        <h1>Academic Issue Tracking System</h1>
        <p>
          A comprehensive solution for logging, tracking, and resolving academic record-related issues at Makerere
          University.
        </p>
      </section>

      {/* Role Sections */}
      <section className="role-sections">
        <div className="role-card">
          <h3>For Students</h3>
          <ul>
            <li>Submit and track academic issues</li>
            <li>Log missing marks issues</li>
            <li>Submit grade appeals</li>
            <li>Request transcripts</li>
            <li>Track progress in real-time</li>
          </ul>
          <button onClick={() => handleRoleRegistration("STUDENT")}>Register as Student</button>
        </div>
        <div className="role-card">
          <h3>For Lecturers</h3>
          <ul>
            <li>Resolve student issues efficiently</li>
            <li>View assigned issues</li>
            <li>Update marks and records</li>
            <li>Respond to student appeals</li>
            <li>Track resolution history</li>
          </ul>
          <button onClick={() => handleRoleRegistration("FACULTY")}>Register as Lecturer</button>
        </div>
        <div className="role-card">
          <h3>For Administrators</h3>
          <ul>
            <li>Manage the academic issue workflow</li>
            <li>Review all submitted issues</li>
            <li>Assign issues to appropriate staff</li>
            <li>Monitor resolution progress</li>
            <li>Generate reports and analytics</li>
          </ul>
          <button onClick={() => handleRoleRegistration("ADMIN")}>Register as Admin</button>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <p>Students submit academic issues with relevant details and supporting documents.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <p>Academic staff review & assign issues to appropriate departments.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <p>Lecturers resolve issues & update status with notifications to students.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 Academic Issue Tracking System - Makerere University</p>
        <p>Designed by CSC 1202 Group 7</p>
      </footer>
    </div>
  )
}

export default Welcome
