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
    <div className="flex justify-center items-center min-h-[80vh] box-border">
      <form 
        className="bg-white p-[30px] rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.1)] w-full max-w-[300px] flex flex-col gap-[15px] box-border" 
        onSubmit={handleLogin}
      >
        <h2 className="text-center m-0 mb-2.5 text-2xl font-bold text-[#111]">Sign In</h2>
        
        {error && <p className="text-red-500 text-[14px] text-center m-0">{error}</p>}

        <input 
          className="p-2.5 rounded border border-[#ccc] text-[16px] text-[#111] outline-none focus:border-[#333] transition-colors" 
          type="text" 
          placeholder="Email or Username" 
          required 
          value={identifier} 
          onChange={(e) => setIdentifier(e.target.value)} 
          disabled={isLoading} 
        />
        
        <input 
          className="p-2.5 rounded border border-[#ccc] text-[16px] text-[#111] outline-none focus:border-[#333] transition-colors" 
          type="password" 
          placeholder="Password" 
          required 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          disabled={isLoading} 
        />

        <button 
          className="p-2.5 bg-[#111] text-white border-none rounded cursor-pointer text-[16px] font-bold transition-colors hover:bg-[#333] disabled:opacity-70 disabled:cursor-not-allowed" 
          type="submit" 
          disabled={isLoading}
        >
          {isLoading ? 'Waking Server ⏳...' : 'Sign In'}
        </button>
        
        <p className="text-center text-[14px] m-0 text-[#555]">
          Don't have an account? <Link to="/signup" className={`text-[#111] font-bold underline hover:text-[#555] ${isLoading ? 'pointer-events-none opacity-50' : ''}`}>Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;