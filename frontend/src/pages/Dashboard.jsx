import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [dashboardData, setDashboardData] = useState([]);
  const [rectificationRequests, setRectificationRequests] = useState([]); 
  const [message, setMessage] = useState({ type: '', text: '' });
  const [myRequestedDates, setMyRequestedDates] = useState([]);

  const todayDate = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);
        fetchDashboardData(payload, token);
        // Now we call this for EVERY role so employees can get their history too
        fetchRectifications(payload, token); 
      } catch (e) {
        showMessage('error', 'Invalid session. Please log in again.');
      }
    }
  }, []);

  // Changed to 3 seconds (3000ms)
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000); 
  };

  const fetchDashboardData = async (userData, token) => {
    try {
      const res = await fetch(`https://project-attendance-management.onrender.com/dashboard?date=${todayDate}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        setDashboardData(data.data);
        const myRecord = data.data.find(record => record.userId === userData.userId && record.date === todayDate);
        if (myRecord) {
          setTodayAttendance(myRecord.attendance);
        }
      }
    } catch (err) {
      showMessage('error', 'Failed to load dashboard data.');
    }
  };

  const fetchRectifications = async (userData, token) => {
    try {
      const res = await fetch('https://project-attendance-management.onrender.com/rectifications', { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      const data = await res.json();
      
      if(res.ok) {
        if (userData.role === 'employee') {
          // Save an array of just the dates they requested
          setMyRequestedDates(data.map(req => req.date));
        } else {
          // Managers and Admins see the full list of pending requests
          setRectificationRequests(data);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAttendance = async (status) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('https://project-attendance-management.onrender.com/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ attendance: status })
      });
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
      const res = await fetch('https://project-attendance-management.onrender.com/attendance/edit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        // FIX: Match the backend variable name perfectly
        body: JSON.stringify({ targetUserId: targetUserId, date, attendance: newStatus })
      });
      const data = await res.json();
      
      if (res.ok) {
        showMessage('success', 'Attendance rectified successfully.');
        fetchDashboardData(user, token);
        // Also refresh the rectification list to remove the approved one
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
      const res = await fetch(`https://project-attendance-management.onrender.com/rectification/${user.userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ date })
      });
      const data = await res.json();
      
      if (res.ok) {
        showMessage('success', 'Rectification request sent to manager.');
        // Instantly disable the button
        setMyRequestedDates(prev => [...prev, date]); 
      } else if (res.status === 409) {
        showMessage('error', 'Rectification already requested for this date.');
        // FIX: Force the button to disable even if they click it and get the 409 error!
        setMyRequestedDates(prev => prev.includes(date) ? prev : [...prev, date]);
      } else {
        showMessage('error', data.message);
      }
    } catch (err) {
      showMessage('error', 'Failed to send request.');
    }
  };

  if (!user) return <div style={{ padding: '20px' }}>Loading Dashboard...</div>;

  // --- INLINE STYLES ---
  const styles = {
    container: { padding: '20px', fontFamily: 'Arial, sans-serif' },
    topRect: {
      backgroundColor: '#1e272e',
      color: '#fff',
      padding: '30px',
      borderRadius: '8px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      marginBottom: '30px',
      minHeight: '120px' 
    },
    infoBlock: { display: 'flex', flexDirection: 'column', gap: '8px' },
    name: { margin: 0, fontSize: '26px', color: '#0fb9b1' },
    details: { margin: 0, fontSize: '16px', color: '#d1d8e0' },
    statusBlock: { textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '15px' },
    statusBadge: { 
      padding: '8px 15px', 
      borderRadius: '20px', 
      fontWeight: 'bold', 
      fontSize: '14px',
      backgroundColor: todayAttendance === 'present' ? '#20bf6b' : todayAttendance === 'absent' ? '#eb3b5a' : '#f7b731',
      color: '#fff',
      display: 'inline-block'
    },
    btnPresent: { padding: '10px 20px', backgroundColor: '#20bf6b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginRight: '10px' },
    btnAbsent: { padding: '10px 20px', backgroundColor: '#eb3b5a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
    card: { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '20px' },
    sectionTitle: { margin: '0 0 15px 0', fontSize: '20px', color: '#333', borderBottom: '2px solid #f1f2f6', paddingBottom: '10px' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    th: { padding: '12px', backgroundColor: '#f8f9fa', borderBottom: '2px solid #dcdde1', color: '#2f3640' },
    td: { padding: '12px', borderBottom: '1px solid #f1f2f6', color: '#353b48' },
    
    // Updated Alert Box (Floating, Z-Index 100, Centered)
    alert: { 
      position: 'fixed',
      top: '30px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 100, // Guarantees it overlaps EVERYTHING
      padding: '15px 30px', 
      borderRadius: '6px', 
      fontWeight: 'bold',
      backgroundColor: message.type === 'error' ? '#ffeaa7' : '#d4efdf',
      color: message.type === 'error' ? '#d63031' : '#27ae60',
      borderLeft: `5px solid ${message.type === 'error' ? '#d63031' : '#27ae60'}`,
      boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
      transition: 'opacity 0.3s ease-in-out'
    }
  };

  return (
    <div style={styles.container}>
      
      {/* Pop-up Alert Box */}
      {message.text && <div style={styles.alert}>{message.text}</div>}

      <div style={styles.topRect}>
        <div style={styles.infoBlock}>
          <h2 style={styles.name}>{user.userName}</h2>
          <p style={styles.details}>Date: <strong>{todayDate}</strong></p>
          <p style={styles.details}>Department: <strong>{user.department}</strong></p>
          <p style={styles.details}>Role: <strong>{user.role.toUpperCase()}</strong></p>
        </div>
        
        <div style={styles.statusBlock}>
          <div>
            Status: <span style={styles.statusBadge}>{todayAttendance ? todayAttendance.toUpperCase() : 'NOT MARKED'}</span>
          </div>

          {user.role !== 'admin' && (
            (user.role === 'manager' || !todayAttendance) && (
              <div>
                <button style={styles.btnPresent} onClick={() => handleMarkAttendance('present')}>
                  {todayAttendance ? 'Change to Present' : 'Mark Present'}
                </button>
                <button style={styles.btnAbsent} onClick={() => handleMarkAttendance('absent')}>
                  {todayAttendance ? 'Change to Absent' : 'Mark Absent'}
                </button>
              </div>
            )
          )}
        </div>
      </div>

      {(user.role === 'manager' || user.role === 'admin') && rectificationRequests.length > 0 && (
        <div style={{ ...styles.card, borderLeft: '4px solid #f7b731' }}>
          <h3 style={styles.sectionTitle}>⚠️ Pending Rectification Requests</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>User ID</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Current Status</th>
                <th style={styles.th}>Requested Edit</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {rectificationRequests.map((req, idx) => (
                <tr key={idx}>
                  <td style={styles.td}>{req.userId}</td>
                  <td style={styles.td}>{req.date}</td>
                  <td style={styles.td}>
                    <span style={{ color: '#eb3b5a', fontWeight: 'bold' }}>{req.attendance.toUpperCase()}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={{ color: '#20bf6b', fontWeight: 'bold' }}>{req.rectification.toUpperCase()}</span>
                  </td>
                  <td style={styles.td}>
                    <button 
                      style={{...styles.btnPresent, padding: '6px 12px', fontSize: '12px'}} 
                      onClick={() => handleEditAttendance(req.userId, req.date, req.rectification)}
                    >
                      Approve Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>
          {user.role === 'employee' ? 'My Recent Attendance' : `${user.department} Sector Attendance (${todayDate})`}
        </h3>
        
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Date</th>
              {user.role !== 'employee' && <th style={styles.th}>User ID</th>}
              {user.role === 'admin' && <th style={styles.th}>Department</th>}
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {dashboardData.length === 0 ? (
              <tr><td colSpan="5" style={{...styles.td, textAlign: 'center'}}>No records found.</td></tr>
            ) : (
              dashboardData.map((record, idx) => (
                <tr key={idx}>
                  <td style={styles.td}>{record.date}</td>
                  
                  {user.role !== 'employee' && <td style={styles.td}>{record.userId}</td>}
                  {user.role === 'admin' && <td style={styles.td}>{record.department}</td>}
                  
                  <td style={styles.td}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                      backgroundColor: record.attendance === 'present' ? '#d4edda' : '#f8d7da',
                      color: record.attendance === 'present' ? '#155724' : '#721c24'
                    }}>
                      {record.attendance.toUpperCase()}
                    </span>
                    {record.rectifed && <span style={{ marginLeft: '8px', fontSize: '11px', color: '#f39c12' }}>(Rectified)</span>}
                  </td>
                  
                  <td style={styles.td}>
                    {user.role === 'employee' && record.date === todayDate && (
                      <button 
                        disabled={myRequestedDates.includes(record.date)}
                        style={{ 
                          padding: '6px 12px', 
                          backgroundColor: myRequestedDates.includes(record.date) ? '#bdc3c7' : '#f1c40f', 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: '4px', 
                          cursor: myRequestedDates.includes(record.date) ? 'not-allowed' : 'pointer', 
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }} 
                        onClick={() => handleRequestRectification(record.date)}
                      >
                        {myRequestedDates.includes(record.date) ? 'Edit Requested ⏳' : 'Request Edit'}
                      </button>
                    )}

                    {(user.role === 'manager' || user.role === 'admin') && (
                      <select 
                        style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc', outline: 'none' }}
                        value={record.attendance}
                        onChange={(e) => handleEditAttendance(record.userId, record.date, e.target.value)}
                      >
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
  );
};

export default Dashboard;