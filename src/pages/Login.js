import React, { useState } from 'react';
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
      setError('Username și parolă sunt necesare!');
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
      
        const { userId, token } = data;

        // Salvezi userId și token în localStorage
        localStorage.setItem('userId', userId);
        localStorage.setItem('token', token);

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
    <div className="login-container">
      <h2>Autentificare</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Parolă</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Autentificare...' : 'Autentificare'}
        </button>
      </form>
    </div>
  );
};

export default Login;
