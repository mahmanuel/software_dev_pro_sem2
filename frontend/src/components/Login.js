// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../mockData';

function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const user = getUser(email);
    if (!user) {
      setError('User not found. Please register first.');
      setTimeout(() => navigate('/register'), 2000);
      return;
    }
    if (user.password !== password) {
      setError('Invalid credentials');
      return;
    }
    localStorage.setItem('user', JSON.stringify({ email, role: user.role }));
    setUser({ email, role: user.role }); // Update App.js state
    user.role === 'registrar' ? navigate('/registrar') : navigate('/student');
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