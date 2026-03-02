import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaClipboardList, FaCog, FaSignOutAlt, FaUser } from 'react-icons/fa'; 

const Sidebar = ({ closeSidebar, isMobile, setToken }) => {
  const location = useLocation();
  const navigate = useNavigate();

  let userRole = '';
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userRole = payload.role;
    } catch (e) {
      console.error("Failed to decode token");
    }
  }

  const getLinkClasses = (path) => {
    const isActive = location.pathname === path;
    return `flex items-center gap-4 px-5 py-4 text-base no-underline border-l-4 transition-all duration-200 ${isActive ? 'text-white bg-[#333] border-white' : 'text-[#a0a0a0] border-transparent hover:bg-[#222] hover:text-[#e0e0e0]'}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null); 
    navigate('/login'); 
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a] text-white shadow-lg">
      <div className="p-6 border-b border-[#333] mb-2">
        <h2 className="m-0 text-[22px] text-white text-center font-bold tracking-wide">Portal</h2>
      </div>

      <nav className="flex flex-col flex-1">
        <Link to="/" className={getLinkClasses('/')} onClick={() => isMobile && closeSidebar && closeSidebar()}>
          <FaHome /> Dashboard
        </Link>
        <Link to="/profile" className={getLinkClasses('/profile')} onClick={() => isMobile && closeSidebar && closeSidebar()}>
          <FaUser /> Profile
        </Link>
        {userRole === 'admin' && (
          <Link to="/log" className={getLinkClasses('/log')} onClick={() => isMobile && closeSidebar && closeSidebar()}>
            <FaClipboardList /> Audit Logs
          </Link>
        )}
        <Link to="/settings" className={getLinkClasses('/settings')} onClick={() => isMobile && closeSidebar && closeSidebar()}>
          <FaCog /> Settings
        </Link>

        <button onClick={handleLogout} className="flex items-center gap-4 px-5 py-4 text-[#eb3b5a] bg-transparent border-none border-l-4 border-transparent text-base cursor-pointer text-left w-full transition-all duration-200 mt-auto hover:bg-[#222] hover:text-[#ff6b81]">
          <FaSignOutAlt /> Logout
        </button>
      </nav>
      
      <div className="p-5 border-t border-[#333] text-xs text-[#7f8fa6] text-center">
        v1.0.0
      </div>
    </div>
  );
};

export default Sidebar;