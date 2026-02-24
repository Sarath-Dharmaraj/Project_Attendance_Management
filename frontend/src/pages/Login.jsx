import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = ({ setToken }) => {
  const navigate = useNavigate(); // Add this back in
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3000/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token); 
        navigate('/'); // Forcefully route to dashboard so the URL updates
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error(err); // Helpful to see the exact error in the console
      setError('Server error. Please try again later.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f7f6' }}>
      <form 
        style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', width: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }} 
        onSubmit={handleLogin}
      >
        <h2 style={{ textAlign: 'center', margin: '0 0 10px 0' }}>Sign In</h2>
        
        {error && <p style={{ color: 'red', fontSize: '14px', textAlign: 'center', margin: 0 }}>{error}</p>}

        <input 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' }} 
          type="text" 
          placeholder="Email or Username" 
          required 
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)} 
        />
        
        <input 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' }} 
          type="password" 
          placeholder="Password" 
          required 
          value={password}
          onChange={(e) => setPassword(e.target.value)} 
        />

        <button 
          style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }} 
          type="submit"
        >
          Sign In
        </button>
        
        <p style={{ textAlign: 'center', fontSize: '14px' }}>
          Don't have an account? <Link to="/signup" style={{ color: '#007bff', textDecoration: 'none' }}>Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;