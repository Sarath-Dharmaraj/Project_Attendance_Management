import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Log from './pages/Log';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Router>
      <div className={`flex h-screen font-sans overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-[#121212] text-[#e0e0e0]' : 'bg-[#f4f7f6] text-[#111]'}`}>
        
        {/* Sidebar Container */}
        {token && (
          <div className={`h-full w-[250px] z-[1000] transition-transform duration-300 ease-in-out ${isMobile ? 'absolute' : 'relative'} ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'} ${isDarkMode ? 'bg-[#1a1a1a] border-r border-[#333]' : 'bg-[#1a1a1a] border-none'}`}>
            <Sidebar closeSidebar={() => setIsSidebarOpen(false)} isMobile={isMobile} isDarkMode={isDarkMode} setToken={setToken} />
          </div>
        )}

        {/* Mobile Backdrop Overlay */}
        {token && isMobile && isSidebarOpen && (
          <div className="absolute inset-0 bg-black/50 z-[999]" onClick={() => setIsSidebarOpen(false)} />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col w-full relative">
          {token && <Header token={token} setToken={setToken} isMobile={isMobile} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />}
          
          <div className="p-5 overflow-y-auto flex-1">
            <Routes>
              <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login setToken={setToken} />} />
              <Route path="/signup" element={token ? <Navigate to="/" replace /> : <Signup setToken={setToken} />} />
              
              {/* Passed setToken down so Dashboard can smoothly kick out expired users */}
              <Route path="/" element={token ? <Dashboard isDarkMode={isDarkMode} setToken={setToken} /> : <Navigate to="/login" replace />} />
              <Route path="/settings" element={token ? <Settings isDarkMode={isDarkMode} /> : <Navigate to="/login" replace />} />
              <Route path="/log" element={token ? <Log isDarkMode={isDarkMode} /> : <Navigate to="/login" replace />} />
              
              <Route path="*" element={<Navigate to={token ? "/" : "/login"} replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;