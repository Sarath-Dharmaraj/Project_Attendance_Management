import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee',
    department: 'IT'
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match!');
    }

    try {
      const response = await fetch('http://localhost:3000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: formData.userName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          department: formData.department
        })
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/login');
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (err) {
      setError('Server error. Please try again later.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f7f6' }}>
      <form 
        style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', width: '350px', display: 'flex', flexDirection: 'column', gap: '15px' }} 
        onSubmit={handleSignup}
      >
        <h2 style={{ textAlign: 'center', margin: '0 0 10px 0' }}>Register</h2>
        
        {error && <p style={{ color: 'red', fontSize: '14px', textAlign: 'center', margin: 0 }}>{error}</p>}

        <input 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' }} 
          type="text" name="userName" placeholder="Username" required onChange={handleChange} 
        />
        <input 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' }} 
          type="email" name="email" placeholder="Email" required onChange={handleChange} 
        />
        <input 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' }} 
          type="password" name="password" placeholder="Password" required onChange={handleChange} 
        />
        <input 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' }} 
          type="password" name="confirmPassword" placeholder="Confirm Password" required onChange={handleChange} 
        />
        
        <select 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px', backgroundColor: 'white' }} 
          name="role" value={formData.role} onChange={handleChange}
        >
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>

        <select 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px', backgroundColor: 'white' }} 
          name="department" value={formData.department} onChange={handleChange}
        >
          <option value="IT">IT</option>
          <option value="HR">HR</option>
          <option value="Support">Support</option>
          <option value="Operations">Operations</option>
        </select>

        <button 
          style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }} 
          type="submit"
        >
          Sign Up
        </button>
        
        <p style={{ textAlign: 'center', fontSize: '14px' }}>
          Already have an account? <Link to="/login" style={{ color: '#007bff', textDecoration: 'none' }}>Sign In</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;