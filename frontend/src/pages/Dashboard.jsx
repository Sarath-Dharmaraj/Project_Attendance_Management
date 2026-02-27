import React, { useState, useEffect } from 'react';
import { FaTriangleExclamation } from "react-icons/fa6";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [dashboardData, setDashboardData] = useState([]);
  const [rectificationRequests, setRectificationRequests] = useState([]); 
  const [message, setMessage] = useState({ type: '', text: '' });
  const [myRequestedDates, setMyRequestedDates] = useState([]);
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
      const res = await fetch(`https://project-attendance-management.onrender.com/dashboard?date=${todayDate}`, { headers: { 'Authorization': `Bearer ${token}` } });
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
    try {
      const res = await fetch('https://project-attendance-management.onrender.com/rectifications', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if(res.ok && Array.isArray(data)) {
        if (userData.role === 'employee') setMyRequestedDates(data.map(req => req.date));
        else setRectificationRequests(data);
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
        showMessage('success', 'Attendance rectified successfully.');
        fetchDashboardData(user, token);
        fetchRectifications(user, token);
      } else {
        showMessage('error', data.message || 'Failed to edit attendance.');
      }
    } catch (err) {
      showMessage('error', 'Server error while editing attendance.');
    }
  };

  const handleRequestRectification = async (date) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`https://project-attendance-management.onrender.com/rectification/${user.userId}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ date }) });
      const data = await res.json();
      if (res.ok) {
        showMessage('success', 'Rectification request sent to manager.');
        setMyRequestedDates(prev => [...prev, date]); 
      } else if (res.status === 409) {
        showMessage('error', 'Rectification already requested for this date.');
        setMyRequestedDates(prev => prev.includes(date) ? prev : [...prev, date]);
      } else {
        showMessage('error', data.message);
      }
    } catch (err) {
      showMessage('error', 'Failed to send request.');
    }
  };

  if (!user) return <div style={{ padding: '20px' }}>Loading Dashboard...</div>;

  return (
    <div style={{ padding: isMobile ? '10px' : '20px', fontFamily: 'Arial, sans-serif', boxSizing: 'border-box', maxWidth: '100vw', overflowX: 'hidden' }}>
      {message.text && <div style={{ position: 'fixed', top: '30px', left: '50%', transform: 'translateX(-50%)', zIndex: 100, padding: '15px 30px', borderRadius: '6px', fontWeight: 'bold', backgroundColor: message.type === 'error' ? '#ffeaa7' : '#d4efdf', color: message.type === 'error' ? '#d63031' : '#27ae60', borderLeft: `5px solid ${message.type === 'error' ? '#d63031' : '#27ae60'}`, boxShadow: '0 8px 16px rgba(0,0,0,0.2)', transition: 'opacity 0.3s ease-in-out' }}>{message.text}</div>}

      <div style={{ backgroundColor: '#1e272e', color: '#fff', padding: isMobile ? '15px' : '30px', borderRadius: '8px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '15px' : '0', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: isMobile ? '15px' : '30px', minHeight: isMobile ? 'auto' : '120px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%' }}>
          <h2 style={{ margin: 0, fontSize: isMobile ? '22px' : '26px', color: '#0fb9b1' }}>{user.userName}</h2>
          <p style={{ margin: 0, fontSize: isMobile ? '14px' : '16px', color: '#d1d8e0' }}>Date: <strong style={{ whiteSpace: 'nowrap' }}>{todayDate}</strong></p>
          <p style={{ margin: 0, fontSize: isMobile ? '14px' : '16px', color: '#d1d8e0' }}>Department: <strong>{user.department}</strong></p>
          <p style={{ margin: 0, fontSize: isMobile ? '14px' : '16px', color: '#d1d8e0' }}>Role: <strong>{user.role?.toUpperCase()}</strong></p>
        </div>
        
        <div style={{ textAlign: isMobile ? 'left' : 'right', display: 'flex', flexDirection: 'column', gap: isMobile ? '10px' : '15px', width: isMobile ? '100%' : 'auto' }}>
          <div style={{ fontSize: isMobile ? '14px' : '16px' }}>
            Status: <span style={{ padding: isMobile ? '6px 12px' : '8px 15px', borderRadius: '20px', fontWeight: 'bold', fontSize: isMobile ? '12px' : '14px', backgroundColor: todayAttendance === 'present' ? '#20bf6b' : todayAttendance === 'absent' ? '#eb3b5a' : '#f7b731', color: '#fff', display: 'inline-block', marginLeft: isMobile ? '0' : '10px', marginTop: isMobile ? '5px' : '0' }}>{todayAttendance ? todayAttendance.toUpperCase() : 'NOT MARKED'}</span>
          </div>
          {user.role !== 'admin' && (user.role === 'manager' || !todayAttendance) && (
            <div style={{ display: 'flex', gap: '10px', flexDirection: isMobile ? 'column' : 'row', width: '100%', justifyContent: isMobile ? 'center' : 'flex-end' }}>
              <button style={{ padding: isMobile ? '10px 15px' : '12px 20px', backgroundColor: '#20bf6b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: isMobile ? '100%' : 'auto', fontSize: isMobile ? '14px' : '16px' }} onClick={() => handleMarkAttendance('present')}>
                {todayAttendance ? 'Change to Present' : 'Mark Present'}
              </button>
              <button style={{ padding: isMobile ? '10px 15px' : '12px 20px', backgroundColor: '#eb3b5a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: isMobile ? '100%' : 'auto', fontSize: isMobile ? '14px' : '16px' }} onClick={() => handleMarkAttendance('absent')}>
                {todayAttendance ? 'Change to Absent' : 'Mark Absent'}
              </button>
            </div>
          )}
        </div>
      </div>

      {(user.role === 'manager' || user.role === 'admin') && (rectificationRequests?.length > 0) && (
        <div style={{ backgroundColor: '#fff', padding: isMobile ? '15px' : '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: isMobile ? '15px' : '20px', borderLeft: '4px solid #f7b731' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: isMobile ? '16px' : '20px', color: '#333', borderBottom: '2px solid #f1f2f6', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}><FaTriangleExclamation color="#f7b731" /> Pending Rectification Requests</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left', fontSize: isMobile ? '14px' : '16px' }}>
              <thead>
                <tr>
                  <th style={{ padding: isMobile ? '8px' : '12px', backgroundColor: '#f8f9fa', borderBottom: '2px solid #dcdde1', color: '#2f3640' }}>User ID</th>
                  <th style={{ padding: isMobile ? '8px' : '12px', backgroundColor: '#f8f9fa', borderBottom: '2px solid #dcdde1', color: '#2f3640', whiteSpace: 'nowrap' }}>Date</th>
                  <th style={{ padding: isMobile ? '8px' : '12px', backgroundColor: '#f8f9fa', borderBottom: '2px solid #dcdde1', color: '#2f3640' }}>Current Status</th>
                  <th style={{ padding: isMobile ? '8px' : '12px', backgroundColor: '#f8f9fa', borderBottom: '2px solid #dcdde1', color: '#2f3640' }}>Requested Edit</th>
                  <th style={{ padding: isMobile ? '8px' : '12px', backgroundColor: '#f8f9fa', borderBottom: '2px solid #dcdde1', color: '#2f3640' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {rectificationRequests.map((req, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: isMobile ? '8px' : '12px', borderBottom: '1px solid #f1f2f6', color: '#353b48' }}>{req.userId}</td>
                    <td style={{ padding: isMobile ? '8px' : '12px', borderBottom: '1px solid #f1f2f6', color: '#353b48', whiteSpace: 'nowrap' }}>{req.date}</td>
                    <td style={{ padding: isMobile ? '8px' : '12px', borderBottom: '1px solid #f1f2f6', color: '#353b48' }}><span style={{ color: '#eb3b5a', fontWeight: 'bold' }}>{req.attendance?.toUpperCase()}</span></td>
                    <td style={{ padding: isMobile ? '8px' : '12px', borderBottom: '1px solid #f1f2f6', color: '#353b48' }}><span style={{ color: '#20bf6b', fontWeight: 'bold' }}>{req.rectification?.toUpperCase()}</span></td>
                    <td style={{ padding: isMobile ? '8px' : '12px', borderBottom: '1px solid #f1f2f6', color: '#353b48' }}>
                      <button style={{ padding: '6px 12px', backgroundColor: '#20bf6b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }} onClick={() => handleEditAttendance(req.userId, req.date, req.rectification)}>Approve Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ backgroundColor: '#fff', padding: isMobile ? '15px' : '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: isMobile ? '16px' : '20px', color: '#333', borderBottom: '2px solid #f1f2f6', paddingBottom: '10px' }}>{user.role === 'employee' ? 'My Recent Attendance' : <>{user.department} Sector Attendance (<span style={{ whiteSpace: 'nowrap' }}>{todayDate}</span>)</>}</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '500px', borderCollapse: 'collapse', textAlign: 'left', fontSize: isMobile ? '14px' : '16px' }}>
            <thead>
              <tr>
                <th style={{ padding: isMobile ? '8px' : '12px', backgroundColor: '#f8f9fa', borderBottom: '2px solid #dcdde1', color: '#2f3640', whiteSpace: 'nowrap' }}>Date</th>
                {user.role !== 'employee' && <th style={{ padding: isMobile ? '8px' : '12px', backgroundColor: '#f8f9fa', borderBottom: '2px solid #dcdde1', color: '#2f3640' }}>User ID</th>}
                {user.role === 'admin' && <th style={{ padding: isMobile ? '8px' : '12px', backgroundColor: '#f8f9fa', borderBottom: '2px solid #dcdde1', color: '#2f3640' }}>Department</th>}
                <th style={{ padding: isMobile ? '8px' : '12px', backgroundColor: '#f8f9fa', borderBottom: '2px solid #dcdde1', color: '#2f3640' }}>Status</th>
                <th style={{ padding: isMobile ? '8px' : '12px', backgroundColor: '#f8f9fa', borderBottom: '2px solid #dcdde1', color: '#2f3640' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {(!dashboardData || dashboardData.length === 0) ? (
                <tr><td colSpan="5" style={{ padding: isMobile ? '8px' : '12px', borderBottom: '1px solid #f1f2f6', color: '#353b48', textAlign: 'center' }}>No records found.</td></tr>
              ) : (
                dashboardData.map((record, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: isMobile ? '8px' : '12px', borderBottom: '1px solid #f1f2f6', color: '#353b48', whiteSpace: 'nowrap' }}>{record.date}</td>
                    {user.role !== 'employee' && <td style={{ padding: isMobile ? '8px' : '12px', borderBottom: '1px solid #f1f2f6', color: '#353b48' }}>{record.userId}</td>}
                    {user.role === 'admin' && <td style={{ padding: isMobile ? '8px' : '12px', borderBottom: '1px solid #f1f2f6', color: '#353b48' }}>{record.department}</td>}
                    <td style={{ padding: isMobile ? '8px' : '12px', borderBottom: '1px solid #f1f2f6', color: '#353b48' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', backgroundColor: record.attendance === 'present' ? '#d4edda' : '#f8d7da', color: record.attendance === 'present' ? '#155724' : '#721c24' }}>
                        {record.attendance?.toUpperCase()}
                      </span>
                      {record.rectified && <span style={{ marginLeft: '8px', fontSize: '11px', color: '#f39c12' }}>(Rectified)</span>}
                    </td>
                    <td style={{ padding: isMobile ? '8px' : '12px', borderBottom: '1px solid #f1f2f6', color: '#353b48' }}>
                      {user.role === 'employee' && record.date === todayDate && (
                        <button disabled={myRequestedDates?.includes(record.date)} style={{ padding: '6px 12px', backgroundColor: myRequestedDates?.includes(record.date) ? '#bdc3c7' : '#f1c40f', color: '#fff', border: 'none', borderRadius: '4px', cursor: myRequestedDates?.includes(record.date) ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: 'bold' }} onClick={() => handleRequestRectification(record.date)}>
                          {myRequestedDates?.includes(record.date) ? 'Edit Requested ⏳' : 'Request Edit'}
                        </button>
                      )}
                      {(user.role === 'manager' || user.role === 'admin') && (
                        <select style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc', outline: 'none' }} value={record.attendance} onChange={(e) => handleEditAttendance(record.userId, record.date, e.target.value)}>
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;