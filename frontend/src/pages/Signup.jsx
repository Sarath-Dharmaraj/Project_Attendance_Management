import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Signup = ({ setToken }) => { 
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ userName: '', email: '', password: '', confirmPassword: '', role: '', department: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match!');
    if (!formData.role) return setError('Please select a role!');
    if (formData.role !== 'admin' && !formData.department) return setError('Please select a department!');

    setIsLoading(true);

    try {
      const response = await fetch('https://project-attendance-management.onrender.com/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: formData.userName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          department: formData.role === 'admin' ? 'All' : formData.department
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Boom! We get the token directly from the signup response now.
        localStorage.setItem('token', data.token);
        if (setToken) setToken(data.token); 
        navigate('/'); // Instantly teleport to Dashboard!
      } else {
        setError(data.message || 'Signup failed');
        setIsLoading(false); 
      }
    } catch (err) {
      setError('Server is waking up or unavailable. Please try again.');
      setIsLoading(false); 
    }
  };

  const radioGroupStyle = { display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', padding: '5px 0' };
  const labelStyle = { fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f4f7f6', padding: '20px', boxSizing: 'border-box' }}>
      <form style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '15px', boxSizing: 'border-box' }} onSubmit={handleSignup}>
        <h2 style={{ textAlign: 'center', margin: '0 0 10px 0' }}>Register</h2>
        
        {error && <p style={{ color: 'red', fontSize: '14px', textAlign: 'center', margin: 0 }}>{error}</p>}

        <input style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' }} type="text" name="userName" placeholder="Username" required onChange={handleChange} disabled={isLoading} />
        <input style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' }} type="email" name="email" placeholder="Email" required onChange={handleChange} disabled={isLoading} />
        <input style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' }} type="password" name="password" placeholder="Password" required onChange={handleChange} disabled={isLoading} />
        <input style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' }} type="password" name="confirmPassword" placeholder="Confirm Password" required onChange={handleChange} disabled={isLoading} />
        
        <div style={{ margin: '5px 0' }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#555' }}>Role:</span>
          <div style={radioGroupStyle}>
            <label style={labelStyle}><input style={{ accentColor: 'black' }} type="radio" name="role" value="employee" checked={formData.role === 'employee'} onChange={handleChange} disabled={isLoading} /> Employee</label>
            <label style={labelStyle}><input style={{ accentColor: 'black' }} type="radio" name="role" value="manager" checked={formData.role === 'manager'} onChange={handleChange} disabled={isLoading} /> Manager</label>
            <label style={labelStyle}><input style={{ accentColor: 'black' }} type="radio" name="role" value="admin" checked={formData.role === 'admin'} onChange={handleChange} disabled={isLoading} /> Admin</label>
          </div>
        </div>

        {formData.role !== 'admin' && (
          <div style={{ margin: '5px 0' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#555' }}>Department:</span>
            <div style={radioGroupStyle}>
              <label style={labelStyle}><input style={{ accentColor: 'black' }} type="radio" name="department" value="IT" checked={formData.department === 'IT'} onChange={handleChange} disabled={isLoading} /> IT</label>
              <label style={labelStyle}><input style={{ accentColor: 'black' }} type="radio" name="department" value="HR" checked={formData.department === 'HR'} onChange={handleChange} disabled={isLoading} /> HR</label>
              <label style={labelStyle}><input style={{ accentColor: 'black' }} type="radio" name="department" value="Support" checked={formData.department === 'Support'} onChange={handleChange} disabled={isLoading} /> Support</label>
              <label style={labelStyle}><input style={{ accentColor: 'black' }} type="radio" name="department" value="Operations" checked={formData.department === 'Operations'} onChange={handleChange} disabled={isLoading} /> Operations</label>
            </div>
          </div>
        )}

        <button style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: isLoading ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: 'bold', opacity: isLoading ? 0.7 : 1, marginTop: '10px' }} type="submit" disabled={isLoading}>
          {isLoading ? 'Creating Account ⏳...' : 'Sign Up'}
        </button>
        
        <p style={{ textAlign: 'center', fontSize: '14px', margin: '10px 0 0 0' }}>
          Already have an account? <Link to="/login" style={{ color: '#007bff', textDecoration: 'none', pointerEvents: isLoading ? 'none' : 'auto' }}>Sign In</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;