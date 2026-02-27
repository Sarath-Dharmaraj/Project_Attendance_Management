import React from 'react';
import { FaBars, FaUserCircle, FaMoon, FaBell } from 'react-icons/fa';

const Header = ({ setToken, isMobile, toggleSidebar }) => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: isMobile ? '10px 15px' : '15px 20px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', zIndex: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '15px' }}>
        {isMobile && <button style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#2f3640', display: 'flex', alignItems: 'center', padding: 0 }} onClick={toggleSidebar}><FaBars /></button>}
        <h2 style={{ margin: 0, fontSize: isMobile ? '16px' : '20px', color: '#2f3640', whiteSpace: 'nowrap' }}>Attendance Portal</h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '15px' : '20px' }}>
        <button style={{ background: 'none', border: 'none', fontSize: isMobile ? '18px' : '20px', cursor: 'pointer', color: '#2f3640', display: 'flex', alignItems: 'center', padding: 0 }} title="Dark Mode"><FaMoon /></button>
        <button style={{ background: 'none', border: 'none', fontSize: isMobile ? '18px' : '20px', cursor: 'pointer', color: '#2f3640', display: 'flex', alignItems: 'center', padding: 0 }} title="Notifications"><FaBell /></button>
        <button style={{ background: 'none', border: 'none', fontSize: isMobile ? '22px' : '26px', cursor: 'pointer', color: '#0fb9b1', display: 'flex', alignItems: 'center', padding: 0 }} onClick={handleLogout} title="Profile / Logout"><FaUserCircle /></button>
      </div>
    </div>
  );
};

export default Header;