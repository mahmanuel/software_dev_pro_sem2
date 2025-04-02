// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './components/Welcome';
import Login from './components/Login';
import Register from './components/Register';
import DashboardStudent from './components/DashboardStudent';
import DashboardRegistrar from './components/DashboardRegistrar';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  // Listen for changes to localStorage (e.g., login/logout)
  useEffect(() => {
    const handleStorageChange = () => {
      setUser(JSON.parse(localStorage.getItem('user')) || null);
    };

    // Listen for storage events (cross-tab changes)
    window.addEventListener('storage', handleStorageChange);

    // Also check on initial load and when user logs in/out in this tab
    handleStorageChange();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register setUser={setUser} />} />
        <Route
          path="/student"
          element={user && user.role === 'student' ? <DashboardStudent setUser={setUser} /> : <Navigate to="/login" />}
        />
        <Route
          path="/registrar"
          element={user && user.role === 'registrar' ? <DashboardRegistrar setUser={setUser} /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;