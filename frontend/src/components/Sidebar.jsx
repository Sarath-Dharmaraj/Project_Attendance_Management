import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaClipboardList, FaCog, FaSignOutAlt } from 'react-icons/fa'; 

const Sidebar = ({ closeSidebar, isMobile }) => {
  const location = useLocation();

  const getLinkStyle = (path) => ({
    display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px', 
    color: location.pathname === path ? '#0fb9b1' : '#d1d8e0', 
    backgroundColor: location.pathname === path ? '#353b48' : 'transparent',
    textDecoration: 'none', fontSize: '16px', borderLeft: location.pathname === path ? '4px solid #0fb9b1' : '4px solid transparent',
    transition: 'all 0.2s ease-in-out'
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login'; 
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#2f3640', color: '#fff', boxShadow: '2px 0 5px rgba(0,0,0,0.1)' }}>
      <div style={{ padding: '25px 20px', borderBottom: '1px solid #353b48', marginBottom: '10px' }}>
        <h2 style={{ margin: 0, fontSize: '22px', color: '#0fb9b1', textAlign: 'center' }}>Portal</h2>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Link to="/" style={getLinkStyle('/')} onClick={() => isMobile && closeSidebar && closeSidebar()}>
          <FaHome /> Dashboard
        </Link>
        <Link to="/log" style={getLinkStyle('/log')} onClick={() => isMobile && closeSidebar && closeSidebar()}>
          <FaClipboardList /> Logs
        </Link>
        <Link to="/settings" style={getLinkStyle('/settings')} onClick={() => isMobile && closeSidebar && closeSidebar()}>
          <FaCog /> Settings
        </Link>

        {/* NEW: Logout Button pinned perfectly underneath the other links */}
        <button style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px', color: '#eb3b5a', backgroundColor: 'transparent', border: 'none', borderLeft: '4px solid transparent', fontSize: '16px', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.2s ease-in-out', marginTop: 'auto' }} onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </nav>
      
      <div style={{ padding: '20px', borderTop: '1px solid #353b48', fontSize: '12px', color: '#7f8fa6', textAlign: 'center' }}>
        v1.0.0
      </div>
    </div>
  );
};

export default Sidebar;