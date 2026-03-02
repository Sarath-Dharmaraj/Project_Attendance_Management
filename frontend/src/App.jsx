import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard.jsx';
import Settings from './pages/Settings';
import Log from './pages/Log';
import './App.css';

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
      {/* Softened the dark mode background to #121212 for less eye strain */}
      <div className={isDarkMode ? 'dark-mode' : 'light-mode'} style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif', backgroundColor: isDarkMode ? '#121212' : '#f4f7f6', color: isDarkMode ? '#e0e0e0' : '#111', overflow: 'hidden', transition: 'background-color 0.3s ease' }}>
        
        {token && (
          <div style={{ position: isMobile ? 'absolute' : 'relative', zIndex: 1000, height: '100%', transform: isMobile && !isSidebarOpen ? 'translateX(-100%)' : 'translateX(0)', transition: 'transform 0.3s ease-in-out', backgroundColor: isDarkMode ? '#1a1a1a' : '#2f3640', width: '250px', borderRight: isDarkMode ? '1px solid #333' : 'none' }}>
            <Sidebar closeSidebar={() => setIsSidebarOpen(false)} isMobile={isMobile} isDarkMode={isDarkMode} />
          </div>
        )}

        {token && isMobile && isSidebarOpen && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999 }} onClick={() => setIsSidebarOpen(false)} />
        )}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
          {token && <Header token={token} setToken={setToken} isMobile={isMobile} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />}
          
          <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
            <Routes>
              <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login setToken={setToken} />} />
              <Route path="/signup" element={token ? <Navigate to="/" replace /> : <Signup setToken={setToken} />} />
              {/* NEW: Passed isDarkMode to the Dashboard! */}
              <Route path="/" element={token ? <Dashboard isDarkMode={isDarkMode} /> : <Navigate to="/login" replace />} />
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