import React, { useState, useEffect } from 'react';

const Header = ({ setToken }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userName, setUserName] = useState('User');

  // Decode the token to get the user's name when the component loads
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // A neat trick to decode the JWT payload without extra libraries
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserName(payload.userName || 'User');
      } catch (e) {
        console.error("Failed to decode token");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null); // Instantly updates the App state to remove layout
    window.location.href = '/login'; 
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between', // Pushes company name left, icons right
      alignItems: 'center',
      height: '70px', // About 5-7% of the viewport height
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e0e0e0',
      padding: '0 30px',
      position: 'relative', // Needed for the absolute positioning of the dropdown
      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
    }}>
      
      {/* Left Side: Company Name */}
      <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#333', letterSpacing: '1px' }}>
        MyCompany Ltd.
      </div>

      {/* Right Side: Icons & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        
        {/* Dark Mode Button (Dummy for now) */}
        <button style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }} title="Toggle Dark Mode">
          🌙
        </button>

        {/* Notifications Button */}
        <button style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }} title="Notifications">
          🔔
        </button>

        {/* Settings Button */}
        <button style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }} title="Settings">
          ⚙️
        </button>

        {/* Profile Wrapper */}
        <div style={{ position: 'relative' }}>
          {/* Profile Icon */}
          <button 
            onClick={toggleDropdown}
            style={{
              background: '#f0f0f0',
              border: '1px solid #ccc',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            title="Profile"
          >
            👤
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '50px', // Pushed down just below the icon
              right: '0',
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              width: '180px',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1000 // Ensures it overlaps page content
            }}>
              
              {/* Username Display */}
              <div style={{ 
                padding: '12px 15px', 
                borderBottom: '1px solid #eee',
                color: '#555',
                fontWeight: 'bold',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                Hi, {userName}
              </div>

              {/* Logout Option */}
              <button 
                onClick={handleLogout}
                style={{ 
                  padding: '12px 15px', 
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#ff4d4d', // Red to match sidebar style
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  textAlign: 'center'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#fff0f0'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Header;