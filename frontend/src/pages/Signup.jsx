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
        localStorage.setItem('token', data.token);
        if (setToken) setToken(data.token); 
        navigate('/'); 
      } else {
        setError(data.message || 'Signup failed');
        setIsLoading(false); 
      }
    } catch (err) {
      setError('Server is waking up or unavailable. Please try again.');
      setIsLoading(false); 
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] box-border">
      <form 
        className="bg-white p-[30px] rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.1)] w-full max-w-[380px] flex flex-col gap-[15px] box-border" 
        onSubmit={handleSignup}
      >
        <h2 className="text-center m-0 mb-2.5 text-2xl font-bold text-[#111]">Register</h2>
        
        {error && <p className="text-red-500 text-[14px] text-center m-0">{error}</p>}

        <input className="p-2.5 rounded border border-[#ccc] text-[16px] text-[#111] outline-none focus:border-[#333] transition-colors" type="text" name="userName" placeholder="Username" required onChange={handleChange} disabled={isLoading} />
        <input className="p-2.5 rounded border border-[#ccc] text-[16px] text-[#111] outline-none focus:border-[#333] transition-colors" type="email" name="email" placeholder="Email" required onChange={handleChange} disabled={isLoading} />
        <input className="p-2.5 rounded border border-[#ccc] text-[16px] text-[#111] outline-none focus:border-[#333] transition-colors" type="password" name="password" placeholder="Password" required onChange={handleChange} disabled={isLoading} />
        <input className="p-2.5 rounded border border-[#ccc] text-[16px] text-[#111] outline-none focus:border-[#333] transition-colors" type="password" name="confirmPassword" placeholder="Confirm Password" required onChange={handleChange} disabled={isLoading} />
        
        <div className="my-[5px]">
          <span className="text-[14px] font-bold text-[#555]">Role:</span>
          <div className="flex justify-between flex-wrap gap-2.5 py-[5px]">
            <label className="text-[15px] cursor-pointer flex items-center gap-[5px] text-[#111]">
              <input className="accent-black w-4 h-4" type="radio" name="role" value="employee" checked={formData.role === 'employee'} onChange={handleChange} disabled={isLoading} /> Employee
            </label>
            <label className="text-[15px] cursor-pointer flex items-center gap-[5px] text-[#111]">
              <input className="accent-black w-4 h-4" type="radio" name="role" value="manager" checked={formData.role === 'manager'} onChange={handleChange} disabled={isLoading} /> Manager
            </label>
            <label className="text-[15px] cursor-pointer flex items-center gap-[5px] text-[#111]">
              <input className="accent-black w-4 h-4" type="radio" name="role" value="admin" checked={formData.role === 'admin'} onChange={handleChange} disabled={isLoading} /> Admin
            </label>
          </div>
        </div>

        {formData.role !== 'admin' && (
          <div className="my-[5px]">
            <span className="text-[14px] font-bold text-[#555]">Department:</span>
            <div className="flex justify-between flex-wrap gap-2.5 py-[5px]">
              <label className="text-[15px] cursor-pointer flex items-center gap-[5px] text-[#111]">
                <input className="accent-black w-4 h-4" type="radio" name="department" value="IT" checked={formData.department === 'IT'} onChange={handleChange} disabled={isLoading} /> IT
              </label>
              <label className="text-[15px] cursor-pointer flex items-center gap-[5px] text-[#111]">
                <input className="accent-black w-4 h-4" type="radio" name="department" value="HR" checked={formData.department === 'HR'} onChange={handleChange} disabled={isLoading} /> HR
              </label>
              <label className="text-[15px] cursor-pointer flex items-center gap-[5px] text-[#111]">
                <input className="accent-black w-4 h-4" type="radio" name="department" value="Support" checked={formData.department === 'Support'} onChange={handleChange} disabled={isLoading} /> Support
              </label>
              <label className="text-[15px] cursor-pointer flex items-center gap-[5px] text-[#111]">
                <input className="accent-black w-4 h-4" type="radio" name="department" value="Operations" checked={formData.department === 'Operations'} onChange={handleChange} disabled={isLoading} /> Operations
              </label>
            </div>
          </div>
        )}

        <button 
          className="p-2.5 mt-2.5 bg-[#111] text-white border-none rounded cursor-pointer text-[16px] font-bold transition-colors hover:bg-[#333] disabled:opacity-70 disabled:cursor-not-allowed" 
          type="submit" 
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account ⏳...' : 'Sign Up'}
        </button>
        
        <p className="text-center text-[14px] m-0 mt-2.5 text-[#555]">
          Already have an account? <Link to="/login" className={`text-[#111] font-bold underline hover:text-[#555] ${isLoading ? 'pointer-events-none opacity-50' : ''}`}>Sign In</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;