import React, { useState, useEffect } from 'react';
import { FaTriangleExclamation } from "react-icons/fa6"; 
import { FaCalendarAlt } from "react-icons/fa";

// NEW: Accept isDarkMode as a prop
const Dashboard = ({ isDarkMode }) => {
  const [user, setUser] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [dashboardData, setDashboardData] = useState([]);
  const [rectificationRequests, setRectificationRequests] = useState([]); 
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const todayDate = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000; 
        if (payload.exp < currentTime) {
          localStorage.removeItem('token'); 
          window.location.href = '/login';   
          return;
        }
        setUser(payload);
        fetchDashboardData(payload, token);
        fetchRectifications(payload, token); 
      } catch (e) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000); 
  };

  const fetchDashboardData = async (userData, token) => {
    try {
      const res = await fetch('https://project-attendance-management.onrender.com/dashboard', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && data?.data) {
        setDashboardData(data.data);
        const myRecord = data.data.find(record => record.userId === userData.userId && record.date === todayDate);
        if (myRecord) setTodayAttendance(myRecord.attendance);
      } else {
        setDashboardData([]); 
      }
    } catch (err) {
      setDashboardData([]); 
      showMessage('error', 'Failed to load dashboard data.');
    }
  };

  const fetchRectifications = async (userData, token) => {
    if (userData.role === 'employee') return; 
    try {
      const res = await fetch('https://project-attendance-management.onrender.com/rectifications', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if(res.ok && Array.isArray(data)) {
        setRectificationRequests(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAttendance = async (status) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('https://project-attendance-management.onrender.com/attendance/mark', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ attendance: status }) });
      const data = await res.json();
      if (res.ok) {
        setTodayAttendance(status);
        showMessage('success', `Successfully marked as ${status}`);
        fetchDashboardData(user, token);
      } else {
        showMessage('error', data.message);
      }
    } catch (err) {
      showMessage('error', 'Server error while marking attendance.');
    }
  };

  const handleEditAttendance = async (targetUserId, date, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('https://project-attendance-management.onrender.com/attendance/edit', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ targetUserId, date, attendance: newStatus }) });
      const data = await res.json();
      if (res.ok) {
        showMessage('success', 'Attendance updated successfully.');
        fetchDashboardData(user, token);
        fetchRectifications(user, token);
      } else {
        showMessage('error', data.message || 'Failed to edit attendance.');
      }
    } catch (err) {
      showMessage('error', 'Server error while editing attendance.');
    }
  };

  if (!user) return <div style={{ padding: '20px', color: isDarkMode ? '#fff' : '#111' }}>Loading Dashboard...</div>;

  const groupedDashboardData = dashboardData.reduce((acc, record) => {
    if (!acc[record.date]) acc[record.date] = [];
    acc[record.date].push(record);
    return acc;
  }, {});
  
  const sortedDates = Object.keys(groupedDashboardData).sort((a, b) => new Date(b) - new Date(a));

  // Themed Colors setup
  const cardBg = isDarkMode ? '#1e1e1e' : '#fff';
  const textColor = isDarkMode ? '#e0e0e0' : '#111';
  const subTextColor = isDarkMode ? '#a0a0a0' : '#444';
  const borderColor = isDarkMode ? '#333' : '#eee';
  const tableHeaderBg = isDarkMode ? '#2c2c2c' : '#f4f4f4';
  const profileCardBg = isDarkMode ? '#1a1a1a' : '#222';

  return (
    <div className="dashboard-wrapper" style={{ padding: isMobile ? '10px' : '20px', fontFamily: 'Arial, sans-serif', boxSizing: 'border-box', maxWidth: '100vw', overflowX: 'hidden' }}>
      
      <style>{`
        ::-webkit-scrollbar { width: 0px; background: transparent; }
        html { scrollbar-width: none; }
        .thin-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .thin-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .thin-scrollbar::-webkit-scrollbar-thumb { background: ${isDarkMode ? '#444' : '#ccc'}; border-radius: 4px; }
        .thin-scrollbar::-webkit-scrollbar-thumb:hover { background: ${isDarkMode ? '#666' : '#999'}; }
      `}</style>

      {message.text && <div style={{ position: 'fixed', top: '30px', left: '50%', transform: 'translateX(-50%)', zIndex: 100, padding: '15px 30px', borderRadius: '6px', fontWeight: 'bold', backgroundColor: message.type === 'error' ? '#f2dede' : '#dff0d8', color: message.type === 'error' ? '#a94442' : '#3c763d', borderLeft: `5px solid ${message.type === 'error' ? '#a94442' : '#3c763d'}`, boxShadow: '0 8px 16px rgba(0,0,0,0.2)', transition: 'opacity 0.3s ease-in-out' }}>{message.text}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
        
        {/* Profile Card */}
        <div style={{ backgroundColor: profileCardBg, color: '#fff', padding: isMobile ? '20px' : '30px', borderRadius: '8px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '20px' : '0', boxShadow: isDarkMode ? 'none' : '0 4px 6px rgba(0,0,0,0.1)', border: isDarkMode ? '1px solid #333' : 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%' }}>
            <h2 style={{ margin: 0, fontSize: isMobile ? '22px' : '26px', color: '#fff' }}>{user.userName}</h2>
            <p style={{ margin: 0, fontSize: isMobile ? '14px' : '16px', color: '#ccc' }}>Date: <strong style={{ whiteSpace: 'nowrap', color: '#fff' }}>{todayDate}</strong></p>
            <p style={{ margin: 0, fontSize: isMobile ? '14px' : '16px', color: '#ccc' }}>Department: <strong style={{ color: '#fff' }}>{user.department}</strong></p>
            <p style={{ margin: 0, fontSize: isMobile ? '14px' : '16px', color: '#ccc' }}>Role: <strong style={{ color: '#fff' }}>{user.role?.toUpperCase()}</strong></p>
          </div>
          
          <div style={{ textAlign: isMobile ? 'left' : 'right', display: 'flex', flexDirection: 'column', gap: isMobile ? '10px' : '15px', width: isMobile ? '100%' : 'auto' }}>
            <div style={{ fontSize: isMobile ? '14px' : '16px', color: '#ccc' }}>
              Status: <span style={{ padding: isMobile ? '6px 12px' : '8px 15px', borderRadius: '4px', fontWeight: 'bold', fontSize: isMobile ? '12px' : '14px', backgroundColor: todayAttendance === 'present' ? '#20bf6b' : todayAttendance === 'absent' ? '#eb3b5a' : '#555', color: '#fff', display: 'inline-block', marginLeft: isMobile ? '0' : '10px', marginTop: isMobile ? '5px' : '0' }}>{todayAttendance ? todayAttendance.toUpperCase() : 'NOT MARKED'}</span>
            </div>
            
            {user.role !== 'admin' && !todayAttendance && (
              <div style={{ display: 'flex', gap: '10px', flexDirection: isMobile ? 'column' : 'row', width: '100%', justifyContent: isMobile ? 'center' : 'flex-end' }}>
                <button style={{ padding: isMobile ? '12px 15px' : '12px 20px', backgroundColor: '#20bf6b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: isMobile ? '100%' : 'auto', fontSize: isMobile ? '14px' : '16px' }} onClick={() => handleMarkAttendance('present')}>Mark Present</button>
                <button style={{ padding: isMobile ? '12px 15px' : '12px 20px', backgroundColor: '#eb3b5a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: isMobile ? '100%' : 'auto', fontSize: isMobile ? '14px' : '16px' }} onClick={() => handleMarkAttendance('absent')}>Mark Absent</button>
              </div>
            )}
            {user.role !== 'admin' && todayAttendance && (
              <div style={{ color: '#20bf6b', fontWeight: 'bold', textAlign: isMobile ? 'left' : 'right', fontSize: isMobile ? '12px' : '14px' }}>Attendance logged for today.</div>
            )}
          </div>
        </div>

        {/* Rectification Card */}
        {(user.role === 'manager' || user.role === 'admin') && (rectificationRequests?.length > 0) && (
          <div className="thin-scrollbar" style={{ backgroundColor: cardBg, padding: isMobile ? '15px' : '20px', borderRadius: '8px', boxShadow: isDarkMode ? 'none' : '0 2px 4px rgba(0,0,0,0.05)', borderLeft: '4px solid #f39c12', border: isDarkMode ? '1px solid #333' : 'none', maxHeight: isMobile ? 'none' : '70vh', overflowY: isMobile ? 'visible' : 'auto' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: isMobile ? '18px' : '20px', color: textColor, borderBottom: `2px solid ${borderColor}`, paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}><FaTriangleExclamation color="#f39c12" /> Pending Rectification Requests</h3>
            
            {isMobile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {rectificationRequests.map((req, idx) => (
                  <div key={idx} style={{ backgroundColor: tableHeaderBg, padding: '15px', borderRadius: '6px', border: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${borderColor}`, paddingBottom: '5px', gap: '10px' }}><strong style={{ color: textColor, fontSize: '12px', whiteSpace: 'nowrap' }}>User ID:</strong> <span style={{ color: subTextColor, fontSize: '11px', wordBreak: 'break-all', textAlign: 'right' }}>{req.userId}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${borderColor}`, paddingBottom: '5px' }}><strong style={{ color: textColor, fontSize: '12px' }}>Date:</strong> <span style={{ color: subTextColor, fontSize: '12px' }}>{req.date}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${borderColor}`, paddingBottom: '5px' }}><strong style={{ color: textColor, fontSize: '12px' }}>Current Status:</strong> <span style={{ color: '#eb3b5a', fontWeight: 'bold', fontSize: '12px' }}>{req.attendance?.toUpperCase()}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${borderColor}`, paddingBottom: '5px' }}><strong style={{ color: textColor, fontSize: '12px' }}>Requested Edit:</strong> <span style={{ color: '#20bf6b', fontWeight: 'bold', fontSize: '12px' }}>{req.rectification?.toUpperCase()}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '5px' }}>
                      <strong style={{ color: textColor, fontSize: '12px' }}>Action:</strong>
                      <button style={{ padding: '8px 15px', backgroundColor: isDarkMode ? '#e0e0e0' : '#333', color: isDarkMode ? '#111' : '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }} onClick={() => handleEditAttendance(req.userId, req.date, req.rectification)}>Approve Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="thin-scrollbar" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px', tableLayout: 'fixed' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '25%', padding: '12px', backgroundColor: tableHeaderBg, borderBottom: `2px solid ${borderColor}`, color: textColor }}>User ID</th>
                      <th style={{ width: '15%', padding: '12px', backgroundColor: tableHeaderBg, borderBottom: `2px solid ${borderColor}`, color: textColor, whiteSpace: 'nowrap' }}>Date</th>
                      <th style={{ width: '20%', padding: '12px', backgroundColor: tableHeaderBg, borderBottom: `2px solid ${borderColor}`, color: textColor }}>Current Status</th>
                      <th style={{ width: '20%', padding: '12px', backgroundColor: tableHeaderBg, borderBottom: `2px solid ${borderColor}`, color: textColor }}>Requested Edit</th>
                      <th style={{ width: '20%', padding: '12px', backgroundColor: tableHeaderBg, borderBottom: `2px solid ${borderColor}`, color: textColor }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rectificationRequests.map((req, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${borderColor}`, color: subTextColor, wordBreak: 'break-all' }}>{req.userId}</td>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${borderColor}`, color: subTextColor, whiteSpace: 'nowrap' }}>{req.date}</td>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${borderColor}`, color: subTextColor }}><span style={{ color: '#eb3b5a', fontWeight: 'bold' }}>{req.attendance?.toUpperCase()}</span></td>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${borderColor}`, color: subTextColor }}><span style={{ color: '#20bf6b', fontWeight: 'bold' }}>{req.rectification?.toUpperCase()}</span></td>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${borderColor}`, color: subTextColor }}><button style={{ padding: '6px 12px', backgroundColor: isDarkMode ? '#e0e0e0' : '#333', color: isDarkMode ? '#111' : '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }} onClick={() => handleEditAttendance(req.userId, req.date, req.rectification)}>Approve Edit</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* History Card */}
        <div className="thin-scrollbar" style={{ backgroundColor: cardBg, padding: isMobile ? '15px' : '20px', borderRadius: '8px', boxShadow: isDarkMode ? 'none' : '0 2px 4px rgba(0,0,0,0.05)', border: isDarkMode ? '1px solid #333' : 'none', maxHeight: isMobile ? 'none' : '70vh', overflowY: isMobile ? 'visible' : 'auto' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: isMobile ? '18px' : '20px', color: textColor, borderBottom: `2px solid ${borderColor}`, paddingBottom: '10px' }}>{user.role === 'employee' ? 'My Attendance History' : user.role === 'admin' ? 'All Sector History' : <span>{user.department} Sector History</span>}</h3>
          
          {sortedDates.length === 0 ? (
            <p style={{ textAlign: 'center', color: subTextColor, padding: '10px', fontSize: isMobile ? '14px' : '16px' }}>No records found.</p>
          ) : (
            sortedDates.map((dateKey) => (
              <div key={dateKey} style={{ marginBottom: isMobile ? '25px' : '20px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: isMobile ? '15px' : '16px', color: textColor, backgroundColor: tableHeaderBg, padding: '8px 12px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px', border: isDarkMode ? '1px solid #333' : 'none' }}><FaCalendarAlt color={isDarkMode ? '#888' : '#666'} /> {dateKey}</h4>
                
                {isMobile ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {groupedDashboardData[dateKey].map((record, idx) => (
                      <div key={idx} style={{ backgroundColor: tableHeaderBg, padding: '12px', borderRadius: '6px', border: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', boxShadow: isDarkMode ? 'none' : '0 1px 2px rgba(0,0,0,0.02)' }}>
                        {user.role !== 'employee' && <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${borderColor}`, paddingBottom: '4px', gap: '10px' }}><strong style={{ color: textColor, fontSize: '12px', whiteSpace: 'nowrap' }}>User ID:</strong> <span style={{ color: subTextColor, fontSize: '11px', wordBreak: 'break-all', textAlign: 'right' }}>{record.userId}</span></div>}
                        {user.role === 'admin' && <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${borderColor}`, paddingBottom: '4px' }}><strong style={{ color: textColor, fontSize: '12px' }}>Department:</strong> <span style={{ color: subTextColor, fontSize: '12px' }}>{record.department}</span></div>}
                        {user.role !== 'employee' && <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${borderColor}`, paddingBottom: '4px' }}><strong style={{ color: textColor, fontSize: '12px' }}>Role:</strong> <span style={{ color: subTextColor, fontSize: '12px' }}>{record.role?.toUpperCase() || 'N/A'}</span></div>}
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${borderColor}`, paddingBottom: '4px', alignItems: 'center' }}>
                          <strong style={{ color: textColor, fontSize: '12px' }}>Status:</strong>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', backgroundColor: record.attendance === 'present' ? '#e8f5e9' : '#ffebee', color: record.attendance === 'present' ? '#2e7d32' : '#c62828' }}>{record.attendance?.toUpperCase()}</span>
                            {record.rectified && <span style={{ fontSize: '10px', color: isDarkMode ? '#bbb' : '#666', backgroundColor: isDarkMode ? '#444' : '#e0e0e0', padding: '2px 6px', borderRadius: '4px', border: isDarkMode ? '1px solid #555' : '1px solid #ccc' }}>RECTIFIED</span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
                          <strong style={{ color: textColor, fontSize: '12px' }}>Action:</strong>
                          {(user.role === 'manager' || user.role === 'admin') ? (
                            <select style={{ padding: '6px 10px', borderRadius: '4px', border: `1px solid ${borderColor}`, outline: 'none', backgroundColor: cardBg, color: textColor, fontSize: '12px' }} value={record.attendance} onChange={(e) => handleEditAttendance(record.userId, record.date, e.target.value)}><option value="present">Present</option><option value="absent">Absent</option></select>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>Locked</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="thin-scrollbar" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', minWidth: '400px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px', tableLayout: 'fixed' }}>
                      <thead>
                        <tr>
                          {user.role !== 'employee' && <th style={{ width: '25%', padding: '12px', backgroundColor: tableHeaderBg, borderBottom: `2px solid ${borderColor}`, color: textColor }}>User ID</th>}
                          {user.role !== 'employee' && <th style={{ width: '15%', padding: '12px', backgroundColor: tableHeaderBg, borderBottom: `2px solid ${borderColor}`, color: textColor }}>Role</th>}
                          {user.role === 'admin' && <th style={{ width: '15%', padding: '12px', backgroundColor: tableHeaderBg, borderBottom: `2px solid ${borderColor}`, color: textColor }}>Department</th>}
                          <th style={{ width: '25%', padding: '12px', backgroundColor: tableHeaderBg, borderBottom: `2px solid ${borderColor}`, color: textColor }}>Status</th>
                          <th style={{ width: '20%', padding: '12px', backgroundColor: tableHeaderBg, borderBottom: `2px solid ${borderColor}`, color: textColor }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupedDashboardData[dateKey].map((record, idx) => (
                          <tr key={idx}>
                            {user.role !== 'employee' && <td style={{ padding: '12px', borderBottom: `1px solid ${borderColor}`, color: subTextColor, wordBreak: 'break-all' }}>{record.userId}</td>}
                            {user.role !== 'employee' && <td style={{ padding: '12px', borderBottom: `1px solid ${borderColor}`, color: subTextColor }}>{record.role?.toUpperCase() || 'N/A'}</td>}
                            {user.role === 'admin' && <td style={{ padding: '12px', borderBottom: `1px solid ${borderColor}`, color: subTextColor }}>{record.department}</td>}
                            <td style={{ padding: '12px', borderBottom: `1px solid ${borderColor}`, color: subTextColor }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', backgroundColor: record.attendance === 'present' ? '#e8f5e9' : '#ffebee', color: record.attendance === 'present' ? '#2e7d32' : '#c62828' }}>{record.attendance?.toUpperCase()}</span>
                                {record.rectified && <span style={{ fontSize: '10px', color: isDarkMode ? '#bbb' : '#666', backgroundColor: isDarkMode ? '#444' : '#e0e0e0', padding: '2px 6px', borderRadius: '4px', border: isDarkMode ? '1px solid #555' : '1px solid #ccc' }}>RECTIFIED</span>}
                              </div>
                            </td>
                            <td style={{ padding: '12px', borderBottom: `1px solid ${borderColor}`, color: subTextColor }}>
                              {(user.role === 'manager' || user.role === 'admin') ? (
                                <select style={{ padding: '6px', borderRadius: '4px', border: `1px solid ${borderColor}`, outline: 'none', backgroundColor: cardBg, color: textColor }} value={record.attendance} onChange={(e) => handleEditAttendance(record.userId, record.date, e.target.value)}><option value="present">Present</option><option value="absent">Absent</option></select>
                              ) : (
                                <span style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>Locked</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;