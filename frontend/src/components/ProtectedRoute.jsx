import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";


const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" />;
  }

  try {
    const user = jwtDecode(token);
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/dashboard" />;
    }
  } catch (error) {
    localStorage.removeItem("token");
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
