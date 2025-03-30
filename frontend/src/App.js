import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import DashboardStudent from './components/DashboardStudent';
import DashboardRegistrar from './components/DashboardRegistrar';

function App() {
  const user = JSON.parse(localStorage.getItem('user')) || null;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/student"
          element={user && user.role === 'student' ? <DashboardStudent /> : <Navigate to="/" />}
        />
        <Route
          path="/registrar"
          element={user && user.role === 'registrar' ? <DashboardRegistrar /> : <Navigate to="/" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;