import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = ({ setToken }) => {
  const navigate = useNavigate(); 
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true); 

    try {
      const response = await fetch('https://project-attendance-management.onrender.com/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token); 
        navigate('/'); 
      } else {
        setError(data.message || 'Invalid credentials');
        setIsLoading(false); 
      }
    } catch (err) {
      console.error(err); 
      setError('Server is waking up or unavailable. Please try again.');
      setIsLoading(false); 
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f4f7f6', padding: '20px', boxSizing: 'border-box' }}>
      <form style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', width: '100%', maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '15px', boxSizing: 'border-box' }} onSubmit={handleLogin}>
        <h2 style={{ textAlign: 'center', margin: '0 0 10px 0' }}>Sign In</h2>
        
        {error && <p style={{ color: 'red', fontSize: '14px', textAlign: 'center', margin: 0 }}>{error}</p>}

        <input style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' }} type="text" placeholder="Email or Username" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} disabled={isLoading} />
        
        <input style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' }} type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />

        <button style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: isLoading ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: 'bold', opacity: isLoading ? 0.7 : 1 }} type="submit" disabled={isLoading}>
          {isLoading ? 'Waking Server ⏳...' : 'Sign In'}
        </button>
        
        <p style={{ textAlign: 'center', fontSize: '14px', margin: 0 }}>
          Don't have an account? <Link to="/signup" style={{ color: '#007bff', textDecoration: 'none', pointerEvents: isLoading ? 'none' : 'auto' }}>Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;