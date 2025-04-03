// frontend/src/components/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function Register({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/register', { email, password });
      const user = response.data; // Expect { email, role, token }
      localStorage.setItem('user', JSON.stringify({ email, role: user.role }));
      if (user.token) localStorage.setItem('token', user.token);
      setUser({ email, role: user.role });
      user.role === 'registrar' ? navigate('/registrar') : navigate('/student');
    } catch (err) {
      setError('Registration failed: ' + (err.response?.data?.message || err.message));
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