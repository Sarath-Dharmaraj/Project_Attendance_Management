import React, { useState } from 'react';
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

  const styles = {
    appContainer: { display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f7f6' },
    mainContent: { flex: 1, display: 'flex', flexDirection: 'column' },
    pageContent: { padding: '20px', overflowY: 'auto', flex: 1 }
  };

  return (
    <Router>
      <div style={styles.appContainer}>
        {token && <Sidebar />}

        <div style={styles.mainContent}>
          {token && <Header setToken={setToken} />}
          
          <div style={styles.pageContent}>
            <Routes>
              {/* AUTH & PROTECTED ROUTES (Single-line style with setToken fix) */}
              <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login setToken={setToken} />} />
              <Route path="/signup" element={token ? <Navigate to="/" replace /> : <Signup setToken={setToken} />} />
              <Route path="/" element={token ? <Dashboard /> : <Navigate to="/login" replace />} />
              <Route path="/settings" element={token ? <Settings /> : <Navigate to="/login" replace />} />
              <Route path="/log" element={token ? <Log /> : <Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to={token ? "/" : "/login"} replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;