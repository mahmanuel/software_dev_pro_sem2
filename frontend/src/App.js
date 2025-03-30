// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';

function App() {
  const user = JSON.parse(localStorage.getItem('user')) || null;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/student" element={user && user.role === 'student' ? <h1>Student Dashboard</h1> : <Navigate to="/" />} />
        <Route path="/registrar" element={user && user.role === 'registrar' ? <h1>Registrar Dashboard</h1> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;