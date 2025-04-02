// src/components/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addUser } from '../mockData';

function Register({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    const user = { email, password, role: email.includes('registrar') ? 'registrar' : 'student' };
    try {
      addUser(user);
      localStorage.setItem('user', JSON.stringify({ email, role: user.role }));
      setUser({ email, role: user.role }); // Update App.js state
      user.role === 'registrar' ? navigate('/registrar') : navigate('/student');
    } catch (err) {
      setError('Registration failed');
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
      <p>Already have an account? <span onClick={() => navigate('/login')} style={{ cursor: 'pointer', color: 'blue' }}>Login</span></p>
    </div>
  );
}

export default Register;