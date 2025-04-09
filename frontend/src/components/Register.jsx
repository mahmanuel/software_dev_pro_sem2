"use client"

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { register } from "../services/authService";

function Register({ setUser }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
    role: "STUDENT", // Default role
    department: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Set the role from navigation state when the component mounts
  useEffect(() => {
    if (location.state && location.state.role) {
      const roleMap = {
        student: "STUDENT",
        lecturer: "FACULTY",
        admin: "ADMIN",
      };
      const mappedRole = roleMap[location.state.role.toLowerCase()] || "STUDENT";
      setFormData((prev) => ({ ...prev, role: mappedRole }));
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.password2) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await register(formData);
      console.log("Registration successful:", response);

      const userData = {
        email: formData.email,
        role: formData.role,
        first_name: formData.first_name,
        last_name: formData.last_name,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      alert("Registration successful! Please log in with your credentials.");
      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err);
      if (typeof err === "object") {
        const errorMessages = Object.entries(err)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ");
        setError(errorMessages);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
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
        <input
          type="text"
          name="department"
          placeholder="Department (optional)"
          value={formData.department}
          onChange={handleChange}
        />
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
    </div>
  );
}

export default Register;