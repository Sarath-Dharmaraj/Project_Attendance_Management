import React, { useState, useEffect, useRef } from 'react';
import { FaBars, FaUserCircle, FaMoon, FaSun, FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Header = ({ token, setToken, isMobile, toggleSidebar, isDarkMode, setIsDarkMode }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null); 
  const navigate = useNavigate();

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
    navigate('/login');
  };

  return (
    <div className={`flex justify-between items-center z-10 transition-colors duration-300 ${isMobile ? 'py-2.5 px-4' : 'py-4 px-5'} ${isDarkMode ? 'bg-[#1e1e1e] border-b border-[#333] shadow-none' : 'bg-white border-b border-[#eee] shadow-[0_2px_4px_rgba(0,0,0,0.02)]'}`}>
      
      <div className={`flex items-center ${isMobile ? 'gap-2.5' : 'gap-[15px]'}`}>
        {isMobile && (
          <button className={`flex items-center p-0 text-xl cursor-pointer bg-transparent border-none ${isDarkMode ? 'text-[#e0e0e0]' : 'text-[#111]'}`} onClick={toggleSidebar}>
            <FaBars />
          </button>
        )}
        <div className={`flex items-start leading-none ${isDarkMode ? 'text-[#e0e0e0]' : 'text-[#111]'}`}>
          <span className={`font-bold underline ${isMobile ? 'text-xs mt-[2px]' : 'text-sm mt-[3px]'}`}>edu</span>
          <span className={`font-black tracking-[-0.5px] ${isMobile ? 'text-[20px]' : 'text-[24px]'}`}>Learner</span>
        </div>
      </div>

      <div className={`flex items-center ${isMobile ? 'gap-[15px]' : 'gap-5'}`}>
        <button className={`flex items-center p-0 cursor-pointer bg-transparent border-none transition-colors hover:opacity-80 ${isMobile ? 'text-[18px]' : 'text-[20px]'} ${isDarkMode ? 'text-[#a0a0a0]' : 'text-[#555]'}`} onClick={() => setIsDarkMode(!isDarkMode)} title="Toggle Dark Mode">
          {isDarkMode ? <FaSun /> : <FaMoon />}
        </button>
        <button className={`flex items-center p-0 cursor-pointer bg-transparent border-none transition-colors hover:opacity-80 ${isMobile ? 'text-[18px]' : 'text-[20px]'} ${isDarkMode ? 'text-[#a0a0a0]' : 'text-[#555]'}`} title="Notifications">
          <FaBell />
        </button>
        
        <div ref={profileRef} className="relative">
          <button className={`flex items-center p-0 cursor-pointer bg-transparent border-none transition-transform hover:scale-105 ${isMobile ? 'text-[22px]' : 'text-[26px]'} ${isDarkMode ? 'text-[#e0e0e0]' : 'text-[#111]'}`} onClick={() => setIsProfileOpen(!isProfileOpen)} title="Profile Menu">
            <FaUserCircle />
          </button>
          
          {isProfileOpen && (
            <div className={`absolute top-full right-0 mt-[15px] w-[160px] p-[15px] rounded-lg flex flex-col gap-[15px] z-20 shadow-[0_8px_16px_rgba(0,0,0,0.2)] ${isDarkMode ? 'bg-[#2d2d2d] border border-[#444]' : 'bg-white border border-[#eee]'}`}>
              <div className={`text-sm pb-2.5 break-all border-b ${isDarkMode ? 'text-[#bbb] border-[#444]' : 'text-[#555] border-[#eee]'}`}>
                Hi, <strong className={isDarkMode ? 'text-white' : 'text-[#111]'}>{userName}</strong>
              </div>
              <button onClick={handleLogout} className={`w-full p-2 text-[13px] font-bold border-none rounded cursor-pointer transition-colors ${isDarkMode ? 'bg-[#e0e0e0] text-[#111] hover:bg-white' : 'bg-[#111] text-white hover:bg-[#333]'}`}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;