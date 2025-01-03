import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    // Validare simplă
    if (!username || !password) {
      setError('Username and password are needed!');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // Trimiterea cererii POST la backend pentru autentificare
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const { userId, token, fullName } = data;

        // Salvezi userId și token în localStorage
        localStorage.setItem('userId', userId);
        localStorage.setItem('token', token);
        localStorage.setItem('fullName', fullName);

        console.log('Autentificare reușită:', userId);
        window.location.href = '/home'; // Redirecționare către pagina Home
      } else {
        setError(data.message || 'A apărut o eroare!');
      }
    } catch (err) {
      setError('Eroare la conectarea la server!');
    }

    setLoading(false);
  };

  return (
    <div className="login-page-container">
      <h2 className="login-title">"Budget wisely, live fully."</h2>
      <form className="login-form" onSubmit={handleLogin}>
        <div className="login-form-field">
          <label htmlFor="username" className="login-label">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="login-input"
          />
        </div>
        <div className="login-form-field">
          <label htmlFor="password" className="login-label">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input"
          />
        </div>
        <div className="register-link">
          <p>Don't have an account? <Link to="/register" className="link-register">Create one here</Link></p>
        </div>
        {error && <p className="login-error">{error}</p>}
        <button type="submit" disabled={loading} className="login-button">
          {loading ? 'Log In...' : 'Log In'}
        </button>
      </form>
    </div>
  );
};

export default Login;
