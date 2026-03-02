import React, { useState, useEffect, useRef } from 'react';
import { FaBars, FaUserCircle, FaMoon, FaSun, FaBell } from 'react-icons/fa';

const Header = ({ token, setToken, isMobile, toggleSidebar, isDarkMode, setIsDarkMode }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null); // Reference to detect outside clicks!

  // The "Click Outside" Listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  let userName = 'User';
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userName = payload.userName || 'User';
    } catch (e) {
      console.error("Failed to decode token");
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: isMobile ? '10px 15px' : '15px 20px', backgroundColor: isDarkMode ? '#1e1e1e' : '#fff', borderBottom: isDarkMode ? '1px solid #333' : '1px solid #eee', boxShadow: isDarkMode ? 'none' : '0 2px 4px rgba(0,0,0,0.02)', zIndex: 10 }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '15px' }}>
        {isMobile && <button style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: isDarkMode ? '#e0e0e0' : '#111', display: 'flex', alignItems: 'center', padding: 0 }} onClick={toggleSidebar}><FaBars /></button>}
        
        <div style={{ display: 'flex', alignItems: 'flex-start', color: isDarkMode ? '#e0e0e0' : '#111', lineHeight: 1 }}>
          <span style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: 'bold', marginTop: isMobile ? '2px' : '3px', textDecoration: "underline" }}>edu</span>
          <span style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '900', letterSpacing: '-0.5px' }}>Learner</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '15px' : '20px' }}>
        <button style={{ background: 'none', border: 'none', fontSize: isMobile ? '18px' : '20px', cursor: 'pointer', color: isDarkMode ? '#a0a0a0' : '#555', display: 'flex', alignItems: 'center', padding: 0 }} onClick={() => setIsDarkMode(!isDarkMode)} title="Toggle Dark Mode">
          {isDarkMode ? <FaSun /> : <FaMoon />}
        </button>
        
        <button style={{ background: 'none', border: 'none', fontSize: isMobile ? '18px' : '20px', cursor: 'pointer', color: isDarkMode ? '#a0a0a0' : '#555', display: 'flex', alignItems: 'center', padding: 0 }} title="Notifications">
          <FaBell />
        </button>
        
        {/* Attached the Ref to this wrapper to track clicks! */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button style={{ background: 'none', border: 'none', fontSize: isMobile ? '22px' : '26px', cursor: 'pointer', color: isDarkMode ? '#e0e0e0' : '#111', display: 'flex', alignItems: 'center', padding: 0 }} onClick={() => setIsProfileOpen(!isProfileOpen)} title="Profile Menu">
            <FaUserCircle />
          </button>
          
          {isProfileOpen && (
            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '15px', backgroundColor: isDarkMode ? '#2d2d2d' : '#fff', border: isDarkMode ? '1px solid #444' : '1px solid #eee', borderRadius: '8px', padding: '15px', width: '160px', boxShadow: '0 8px 16px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', gap: '15px', zIndex: 20 }}>
              <div style={{ fontSize: '14px', color: isDarkMode ? '#bbb' : '#555', borderBottom: isDarkMode ? '1px solid #444' : '1px solid #eee', paddingBottom: '10px', wordBreak: 'break-all' }}>Hi, <strong style={{ color: isDarkMode ? '#fff' : '#111' }}>{userName}</strong></div>
              <button onClick={handleLogout} style={{ width: '100%', padding: '8px', backgroundColor: isDarkMode ? '#e0e0e0' : '#111', color: isDarkMode ? '#111' : '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;