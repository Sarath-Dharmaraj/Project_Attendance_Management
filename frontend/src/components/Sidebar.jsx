import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBook, FaChartLine, FaRightFromBracket } from "react-icons/fa6";
import { IoSettings } from "react-icons/io5";

const Sidebar = () => {

  const handleLogout = () => {
    // Clear the token from local storage
    localStorage.removeItem('token');
    // Force a page reload to clear the app state and send the user to /login
    window.location.href = '/login'; 
  };

  // --- AUTO LOGOUT TIMER ---
  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Date.now() / 1000; // Convert to seconds
          
          // If the token is expired, automatically log them out
          if (payload.exp < currentTime) {
            handleLogout();
          }
        } catch (e) {
          // If the token is somehow corrupted, log them out for safety
          handleLogout();
        }
      }
    };

    // Check instantly when the Sidebar loads
    checkTokenExpiration();

    // Then check silently every 60 seconds (60000 ms) in the background
    const intervalId = setInterval(checkTokenExpiration, 60000);

    // Cleanup the timer if the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div style={{
      width: '250px',
      backgroundColor: '#111', 
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      boxShadow: '2px 0 5px rgba(0,0,0,0.5)' 
    }}>
      
      {/* Top Section: Logo & Nav */}
      <div>
        <div style={{
          padding: '25px 20px',
          fontSize: '24px',
          fontWeight: 'bold',
          borderBottom: '1px solid #333',
          textAlign: 'center',
          letterSpacing: '2px',
          color: '#00a8ff' 
        }}>
          ATTENDANCE
        </div>

        {/* Navigation Elements - Added Flex & Gap to align icons nicely! */}
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: '20px' }}>
          <Link to="/" style={{ color: '#ccc', textDecoration: 'none', padding: '15px 25px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FaChartLine /> Dashboard
          </Link>
          <Link to="/log" style={{ color: '#ccc', textDecoration: 'none', padding: '15px 25px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FaBook /> Log
          </Link>
          <Link to="/settings" style={{ color: '#ccc', textDecoration: 'none', padding: '15px 25px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <IoSettings /> Settings
          </Link>
        </div>
      </div>

      {/* Bottom Section: Logout */}
      <div style={{ 
        marginTop: 'auto', 
        padding: '20px', 
        borderTop: '1px solid #333' 
      }}>
        <button 
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: 'transparent',
            color: '#ff4d4d', 
            border: '1px solid #ff4d4d', 
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            transition: 'background-color 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 77, 77, 0.1)'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <FaRightFromBracket /> Logout
        </button>
      </div>
      
    </div>
  );
};

export default Sidebar;