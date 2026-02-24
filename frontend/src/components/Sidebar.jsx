import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {

  const handleLogout = () => {
    // Clear the token from local storage
    localStorage.removeItem('token');
    // Force a page reload to clear the app state and send the user to /login
    window.location.href = '/login'; 
  };

  return (
    <div style={{
      width: '250px',
      backgroundColor: '#111', // Black background
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      boxShadow: '2px 0 5px rgba(0,0,0,0.5)' // Slight shadow to separate from main content
    }}>
      
      {/* Top Section: Logo & Nav */}
      <div>
        {/* Logo Space */}
        <div style={{
          padding: '25px 20px',
          fontSize: '24px',
          fontWeight: 'bold',
          borderBottom: '1px solid #333',
          textAlign: 'center',
          letterSpacing: '2px',
          color: '#00a8ff' // A sharp blue to contrast with the black
        }}>
          ATTENDANCE
        </div>

        {/* Navigation Elements */}
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: '20px' }}>
          <Link to="/" style={{ color: '#ccc', textDecoration: 'none', padding: '15px 25px', fontSize: '16px', display: 'block' }}>
            📊 Dashboard
          </Link>
          <Link to="/log" style={{ color: '#ccc', textDecoration: 'none', padding: '15px 25px', fontSize: '16px', display: 'block' }}>
            📋 Log
          </Link>
          <Link to="/settings" style={{ color: '#ccc', textDecoration: 'none', padding: '15px 25px', fontSize: '16px', display: 'block' }}>
            ⚙️ Settings
          </Link>
        </div>
      </div>

      {/* Bottom Section: Logout */}
      <div style={{ 
        marginTop: 'auto', // Pushes this container to the absolute bottom
        padding: '20px', 
        borderTop: '1px solid #333' 
      }}>
        <button 
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: 'transparent',
            color: '#ff4d4d', // Red text
            border: '1px solid #ff4d4d', // Red border
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          🚪 Logout
        </button>
      </div>
      
    </div>
  );
};

export default Sidebar;