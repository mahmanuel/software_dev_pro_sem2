"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import { DEPARTMENTS } from "../constants/academicConstants";

function Register({ setUser }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
    role: "STUDENT",
    department: "",
    student_id: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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

    // Validate passwords match
    if (formData.password !== formData.password2) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Validate department is selected
    if (!formData.department) {
      setError("Please select a department");
      setIsLoading(false);
      return;
    }

    // Validate student ID for students
    if (formData.role === "STUDENT" && !formData.student_id) {
      setError("Student ID is required for student accounts");
      setIsLoading(false);
      return;
    }

    try {
      // Register the user
      const response = await register(formData);
      console.log("Registration successful:", response);

      // Store user info in localStorage
      const userData = {
        email: formData.email,
        role: formData.role,
        first_name: formData.first_name,
        last_name: formData.last_name,
      };

      localStorage.setItem("user", JSON.stringify(userData));

      // Update app state
      setUser(userData);

      // Show success message
      alert("Registration successful! Please log in with your credentials.");

      // Redirect to login page
      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err);
      if (typeof err === "object") {
        // Format error messages from the API
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
    <div className="register-container max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Register</h2>
      <form onSubmit={handleRegister} className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={formData.first_name}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={formData.last_name}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="STUDENT">Student</option>
          <option value="FACULTY">Faculty</option>
          <option value="ADMIN">Admin</option>
        </select>
        <select
          name="department"
          value={formData.department}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
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
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          name="password2"
          placeholder="Confirm Password"
          value={formData.password2}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {formData.role === "STUDENT" && (
          <div className="form-group space-y-2">
            <label htmlFor="student_id" className="text-sm text-gray-600">
              Student ID
            </label>
            <input
              id="student_id"
              type="text"
              name="student_id"
              value={formData.student_id}
              onChange={handleChange}
              required={formData.role === "STUDENT"}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full p-2 rounded-md text-white ${
            isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          } transition-colors duration-200`}
        >
          {isLoading ? "Registering..." : "Register"}
        </button>
        {error && (
          <p className="error-message text-red-500 text-sm mt-2" role="alert">
            {error}
          </p>
        )}
      </form>
      <p className="mt-4 text-center text-gray-600">
        Already have an account?{" "}
        <span
          onClick={() => navigate("/login")}
          className="link-text text-blue-500 hover:underline cursor-pointer"
        >
          Login
        </span>
      </p>
    </div>
  );
}

export default Register;
