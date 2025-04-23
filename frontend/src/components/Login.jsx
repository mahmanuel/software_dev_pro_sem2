"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { login, getCurrentUser } from "../services/authService";
import LoadingSpinner from "./LoadingSpinner";

function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login({ email, password });
      const userProfile = await getCurrentUser();
      const userData = {
        id: userProfile.id,
        email: userProfile.email,
        role: userProfile.role,
        first_name: userProfile.first_name,
        last_name: userProfile.last_name,
        department: userProfile.department,
      };
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      toast.success("Logged in successfully!");
      navigate(
        userProfile.role === "FACULTY" || userProfile.role === "faculty"
          ? "/lecturer"
          : userProfile.role === "STUDENT" || userProfile.role === "student"
          ? "/student"
          : "/registrar"
      );
    } catch (err) {
      console.error("Login error:", err);
      const errorMsg =
        typeof err === "object"
          ? Object.entries(err)
              .map(([k, v]) => `${k}: ${v}`)
              .join(", ")
          : "Invalid credentials.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login to Your Account</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            disabled={isLoading}
          />
        </div>
        <button type="submit" className="login-button" disabled={isLoading}>
          {isLoading ? <LoadingSpinner /> : "Login"}
        </button>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
}

export default Login;