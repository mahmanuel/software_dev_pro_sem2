// frontend/src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/login', { email, password });
      const user = response.data; // Expect { email, role, token }
      if (!user) {
        setError('User not found. Please register first.');
        setTimeout(() => navigate('/register'), 2000);
        return;
      }
      localStorage.setItem('user', JSON.stringify({ email, role: user.role }));
      if (user.token) localStorage.setItem('token', user.token);
      setUser({ email, role: user.role });
      user.role === 'registrar' ? navigate('/registrar') : navigate('/student');
    } catch (err) {
      setError('Login failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}

export default Login;