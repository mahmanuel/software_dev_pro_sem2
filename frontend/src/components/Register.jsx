"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { register } from "../services/authService"
import { DEPARTMENTS } from "../constants/academicConstants"

function Register({ setUser }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
    role: "STUDENT", // Default to "STUDENT"
    department: "",
    student_id: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Update role based on the query parameter (e.g., ?role=STUDENT)
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    const roleFromUrl = queryParams.get("role")
    if (roleFromUrl) {
      setFormData((prevData) => ({
        ...prevData,
        role: roleFromUrl.toUpperCase(), // Ensure the role is in uppercase (STUDENT, FACULTY, ADMIN)
      }))
    }
  }, [location])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validate passwords match
    if (formData.password !== formData.password2) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    // Validate department is selected
    if (!formData.department) {
      setError("Please select a department")
      setIsLoading(false)
      return
    }

    // Validate student ID for students
    if (formData.role === "STUDENT" && !formData.student_id) {
      setError("Student ID is required for student accounts")
      setIsLoading(false)
      return
    }

    try {
      // Register the user
      const response = await register(formData)
      console.log("Registration successful:", response)

      // Store user info in localStorage
      const userData = {
        email: formData.email,
        role: formData.role,
        first_name: formData.first_name,
        last_name: formData.last_name,
      }

      localStorage.setItem("user", JSON.stringify(userData))

      // Update app state
      setUser(userData)

      // Show success message
      alert("Registration successful! Please log in with your credentials.")

      // Redirect to login page
      navigate("/login")
    } catch (err) {
      console.error("Registration error:", err)
      if (typeof err === "object") {
        // Format error messages from the API
        const errorMessages = Object.entries(err)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ")
        setError(errorMessages)
      } else {
        setError("Registration failed. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={formData.first_name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={formData.last_name}
          onChange={handleChange}
          required
        />
        <select name="role" value={formData.role} onChange={handleChange} required>
          <option value="STUDENT">Student</option>
          <option value="FACULTY">Faculty</option>
          <option value="ADMIN">Admin</option>
        </select>
        <select name="department" value={formData.department} onChange={handleChange} className="input" >
          <option value="">Select Department</option>
          {DEPARTMENTS.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password2"
          placeholder="Confirm Password"
          value={formData.password2}
          onChange={handleChange}
          required
        />
        {formData.role === "STUDENT" && (
          <div className="form-group">
            <label htmlFor="student_id">Student ID</label>
            <input
              id="student_id"
              type="text"
              name="student_id"
              value={formData.student_id}
              onChange={handleChange}
              required={formData.role === "STUDENT"}
            />
          </div>
        )}
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Registering..." : "Register"}
        </button>
        {error && <p className="error-message">{error}</p>}
      </form>
      <p>
        Already have an account?{" "}
        <span onClick={() => navigate("/login")} className="link-text">
          Login
        </span>
      </p>

      {/* Back to Welcome page button */}
      <button className="back-to-welcome-button" onClick={() => navigate("/")}>
        Back to Welcome Page
      </button>
    </div>
  )
}

export default Register
