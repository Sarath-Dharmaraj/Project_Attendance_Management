import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTriangleExclamation } from "react-icons/fa6"; 
import { FaCalendarAlt } from "react-icons/fa";

const Dashboard = ({ isDarkMode, setToken }) => {
  const [user, setUser] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [dashboardData, setDashboardData] = useState([]);
  const [rectificationRequests, setRectificationRequests] = useState([]); 
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  const navigate = useNavigate();
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
          setToken(null);
          navigate('/login');
          return;
        }
        setUser(payload);
        fetchDashboardData(payload, token);
        fetchRectifications(payload, token); 
      } catch (e) {
        localStorage.removeItem('token');
        setToken(null);
        navigate('/login');
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

  if (!user) return <div className={`p-5 ${isDarkMode ? 'text-white' : 'text-[#111]'}`}>Loading Dashboard...</div>;

  const groupedDashboardData = dashboardData.reduce((acc, record) => {
    if (!acc[record.date]) acc[record.date] = [];
    acc[record.date].push(record);
    return acc;
  }, {});
  
  const sortedDates = Object.keys(groupedDashboardData).sort((a, b) => new Date(b) - new Date(a));

  const cardTheme = isDarkMode ? 'bg-[#1e1e1e] border border-[#333] shadow-none' : 'bg-white border-none shadow-[0_2px_4px_rgba(0,0,0,0.05)]';
  const textTheme = isDarkMode ? 'text-[#e0e0e0]' : 'text-[#111]';
  const subTextTheme = isDarkMode ? 'text-[#a0a0a0]' : 'text-[#444]';
  const borderTheme = isDarkMode ? 'border-[#333]' : 'border-[#eee]';
  const headerBgTheme = isDarkMode ? 'bg-[#2c2c2c]' : 'bg-[#f4f4f4]';
  const profileTheme = isDarkMode ? 'bg-[#1a1a1a] border border-[#333]' : 'bg-[#222] border-none shadow-md';

  return (
    <div className="p-2.5 md:p-5 font-sans box-border max-w-[100vw] overflow-x-hidden">
      
      <style>{`
        ::-webkit-scrollbar { width: 0px; background: transparent; }
        html { scrollbar-width: none; }
        .thin-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .thin-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .thin-scrollbar::-webkit-scrollbar-thumb { background: ${isDarkMode ? '#444' : '#ccc'}; border-radius: 4px; }
        .thin-scrollbar::-webkit-scrollbar-thumb:hover { background: ${isDarkMode ? '#666' : '#999'}; }
      `}</style>

      {message.text && (
        <div className={`fixed top-[30px] left-1/2 -translate-x-1/2 z-[100] px-7 py-4 rounded-md font-bold shadow-lg transition-opacity duration-300 border-l-[5px] ${message.type === 'error' ? 'bg-[#f2dede] text-[#a94442] border-[#a94442]' : 'bg-[#dff0d8] text-[#3c763d] border-[#3c763d]'}`}>
          {message.text}
        </div>
      )}

      <div className="flex flex-col gap-5 w-full">
        
        <div className={`p-5 md:p-[30px] rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-5 md:gap-0 ${profileTheme}`}>
          <div className="flex flex-col gap-1.5 w-full text-white">
            <h2 className="m-0 text-[22px] md:text-[26px]">{user.userName}</h2>
            <p className="m-0 text-[14px] md:text-[16px] text-[#ccc]">Date: <strong className="whitespace-nowrap text-white">{todayDate}</strong></p>
            <p className="m-0 text-[14px] md:text-[16px] text-[#ccc]">Department: <strong className="text-white">{user.department}</strong></p>
            <p className="m-0 text-[14px] md:text-[16px] text-[#ccc]">Role: <strong className="text-white">{user.role?.toUpperCase()}</strong></p>
          </div>
          
          <div className="text-left md:text-right flex flex-col gap-2.5 md:gap-4 w-full md:w-auto">
            <div className="text-[14px] md:text-[16px] text-[#ccc]">
              Status: <span className={`px-3 md:px-4 py-1.5 md:py-2 rounded-[4px] font-bold text-[12px] md:text-[14px] text-white inline-block ml-0 md:ml-2.5 mt-1.5 md:mt-0 ${todayAttendance === 'present' ? 'bg-[#20bf6b]' : todayAttendance === 'absent' ? 'bg-[#eb3b5a]' : 'bg-[#555]'}`}>
                {todayAttendance ? todayAttendance.toUpperCase() : 'NOT MARKED'}
              </span>
            </div>
            
            {user.role !== 'admin' && !todayAttendance && (
              <div className="flex flex-col md:flex-row gap-2.5 w-full justify-center md:justify-end">
                <button className="py-3 px-[15px] md:px-[20px] bg-[#20bf6b] text-white border-none rounded-[4px] cursor-pointer font-bold w-full md:w-auto text-[14px] md:text-[16px] transition-opacity hover:opacity-80" onClick={() => handleMarkAttendance('present')}>Mark Present</button>
                <button className="py-3 px-[15px] md:px-[20px] bg-[#eb3b5a] text-white border-none rounded-[4px] cursor-pointer font-bold w-full md:w-auto text-[14px] md:text-[16px] transition-opacity hover:opacity-80" onClick={() => handleMarkAttendance('absent')}>Mark Absent</button>
              </div>
            )}
            {user.role !== 'admin' && todayAttendance && (
              <div className="text-[#20bf6b] font-bold text-left md:text-right text-[12px] md:text-[14px]">Attendance logged for today.</div>
            )}
          </div>
        </div>

        {(user.role === 'manager' || user.role === 'admin') && (rectificationRequests?.length > 0) && (
          <div className={`p-[15px] md:p-[20px] rounded-lg border-l-4 border-l-[#f39c12] max-h-none md:max-h-[70vh] overflow-y-visible md:overflow-y-auto thin-scrollbar ${cardTheme}`}>
            <h3 className={`m-0 mb-[15px] text-[18px] md:text-[20px] border-b-2 pb-2.5 flex items-center gap-2 ${textTheme} ${borderTheme}`}>
              <FaTriangleExclamation className="text-[#f39c12]" /> Pending Rectification Requests
            </h3>
            
            {isMobile ? (
              <div className="flex flex-col gap-[15px]">
                {rectificationRequests.map((req, idx) => (
                  <div key={idx} className={`p-[15px] rounded-[6px] border flex flex-col gap-2 text-[14px] ${headerBgTheme} ${borderTheme}`}>
                    <div className={`flex justify-between border-b pb-[5px] gap-2.5 ${borderTheme}`}><strong className={`text-[12px] whitespace-nowrap ${textTheme}`}>User ID:</strong> <span className={`text-[11px] break-all text-right ${subTextTheme}`}>{req.userId}</span></div>
                    <div className={`flex justify-between border-b pb-[5px] ${borderTheme}`}><strong className={`text-[12px] ${textTheme}`}>Date:</strong> <span className={`text-[12px] ${subTextTheme}`}>{req.date}</span></div>
                    <div className={`flex justify-between border-b pb-[5px] ${borderTheme}`}><strong className={`text-[12px] ${textTheme}`}>Current Status:</strong> <span className="text-[#eb3b5a] font-bold text-[12px]">{req.attendance?.toUpperCase()}</span></div>
                    <div className={`flex justify-between border-b pb-[5px] ${borderTheme}`}><strong className={`text-[12px] ${textTheme}`}>Requested Edit:</strong> <span className="text-[#20bf6b] font-bold text-[12px]">{req.rectification?.toUpperCase()}</span></div>
                    <div className="flex justify-between items-center pt-[5px]">
                      <strong className={`text-[12px] ${textTheme}`}>Action:</strong>
                      <button className={`py-2 px-[15px] border-none rounded-[4px] cursor-pointer font-bold text-[12px] transition-opacity hover:opacity-80 ${isDarkMode ? 'bg-[#e0e0e0] text-[#111]' : 'bg-[#333] text-white'}`} onClick={() => handleEditAttendance(req.userId, req.date, req.rectification)}>Approve Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto thin-scrollbar">
                <table className="w-full min-w-[600px] border-collapse text-left text-[14px] table-fixed">
                  <thead>
                    <tr>
                      <th className={`w-1/4 p-3 border-b-2 ${headerBgTheme} ${borderTheme} ${textTheme}`}>User ID</th>
                      <th className={`w-[15%] p-3 border-b-2 whitespace-nowrap ${headerBgTheme} ${borderTheme} ${textTheme}`}>Date</th>
                      <th className={`w-1/5 p-3 border-b-2 ${headerBgTheme} ${borderTheme} ${textTheme}`}>Current Status</th>
                      <th className={`w-1/5 p-3 border-b-2 ${headerBgTheme} ${borderTheme} ${textTheme}`}>Requested Edit</th>
                      <th className={`w-1/5 p-3 border-b-2 ${headerBgTheme} ${borderTheme} ${textTheme}`}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rectificationRequests.map((req, idx) => (
                      <tr key={idx} className={`transition-colors ${isDarkMode ? 'hover:bg-[#252525]' : 'hover:bg-[#fafafa]'}`}>
                        <td className={`p-3 border-b break-all ${borderTheme} ${subTextTheme}`}>{req.userId}</td>
                        <td className={`p-3 border-b whitespace-nowrap ${borderTheme} ${subTextTheme}`}>{req.date}</td>
                        <td className={`p-3 border-b ${borderTheme} ${subTextTheme}`}><span className="text-[#eb3b5a] font-bold">{req.attendance?.toUpperCase()}</span></td>
                        <td className={`p-3 border-b ${borderTheme} ${subTextTheme}`}><span className="text-[#20bf6b] font-bold">{req.rectification?.toUpperCase()}</span></td>
                        <td className={`p-3 border-b ${borderTheme} ${subTextTheme}`}><button className={`py-1.5 px-3 border-none rounded-[4px] cursor-pointer font-bold text-[12px] transition-opacity hover:opacity-80 ${isDarkMode ? 'bg-[#e0e0e0] text-[#111]' : 'bg-[#333] text-white'}`} onClick={() => handleEditAttendance(req.userId, req.date, req.rectification)}>Approve Edit</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <div className={`p-[15px] md:p-[20px] rounded-lg max-h-none md:max-h-[70vh] overflow-y-visible md:overflow-y-auto thin-scrollbar ${cardTheme}`}>
          <h3 className={`m-0 mb-[15px] text-[18px] md:text-[20px] border-b-2 pb-2.5 ${textTheme} ${borderTheme}`}>
            {user.role === 'employee' ? 'My Attendance History' : user.role === 'admin' ? 'All Sector History' : <span>{user.department} Sector History</span>}
          </h3>
          
          {sortedDates.length === 0 ? (
            <p className={`text-center p-2.5 text-[14px] md:text-[16px] ${subTextTheme}`}>No records found.</p>
          ) : (
            sortedDates.map((dateKey) => (
              <div key={dateKey} className="mb-5 md:mb-6">
                <h4 className={`m-0 mb-2.5 text-[15px] md:text-[16px] py-2 px-3 rounded-[4px] flex items-center gap-2 ${headerBgTheme} ${textTheme} ${isDarkMode ? 'border border-[#333]' : ''}`}>
                  <FaCalendarAlt className={isDarkMode ? 'text-[#888]' : 'text-[#666]'} /> {dateKey}
                </h4>
                
                {isMobile ? (
                  <div className="flex flex-col gap-2.5">
                    {groupedDashboardData[dateKey].map((record, idx) => (
                      <div key={idx} className={`p-3 rounded-[6px] border flex flex-col gap-1.5 text-[14px] ${headerBgTheme} ${borderTheme} ${isDarkMode ? 'shadow-none' : 'shadow-[0_1px_2px_rgba(0,0,0,0.02)]'}`}>
                        {user.role !== 'employee' && <div className={`flex justify-between border-b pb-1 gap-2.5 ${borderTheme}`}><strong className={`text-[12px] whitespace-nowrap ${textTheme}`}>User ID:</strong> <span className={`text-[11px] break-all text-right ${subTextTheme}`}>{record.userId}</span></div>}
                        {user.role === 'admin' && <div className={`flex justify-between border-b pb-1 ${borderTheme}`}><strong className={`text-[12px] ${textTheme}`}>Department:</strong> <span className={`text-[12px] ${subTextTheme}`}>{record.department}</span></div>}
                        {user.role !== 'employee' && <div className={`flex justify-between border-b pb-1 ${borderTheme}`}><strong className={`text-[12px] ${textTheme}`}>Role:</strong> <span className={`text-[12px] ${subTextTheme}`}>{record.role?.toUpperCase() || 'N/A'}</span></div>}
                        <div className={`flex justify-between border-b pb-1 items-center ${borderTheme}`}>
                          <strong className={`text-[12px] ${textTheme}`}>Status:</strong>
                          <div className="flex items-center gap-1.5">
                            <span className={`py-1 px-2 rounded-[4px] text-[11px] font-bold ${record.attendance === 'present' ? 'bg-[#e8f5e9] text-[#2e7d32]' : 'bg-[#ffebee] text-[#c62828]'}`}>{record.attendance?.toUpperCase()}</span>
                            {record.rectified && <span className={`text-[10px] py-[2px] px-1.5 rounded-[4px] border ${isDarkMode ? 'text-[#bbb] bg-[#444] border-[#555]' : 'text-[#666] bg-[#e0e0e0] border-[#ccc]'}`}>RECTIFIED</span>}
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <strong className={`text-[12px] ${textTheme}`}>Action:</strong>
                          {(user.role === 'manager' || user.role === 'admin') ? (
                            <select className={`py-1.5 px-2.5 rounded-[4px] border outline-none text-[12px] ${isDarkMode ? 'bg-[#1e1e1e] text-[#e0e0e0] border-[#333]' : 'bg-white text-[#111] border-[#ccc]'}`} value={record.attendance} onChange={(e) => handleEditAttendance(record.userId, record.date, e.target.value)}>
                              <option value="present">Present</option><option value="absent">Absent</option>
                            </select>
                          ) : (
                            <span className="text-[12px] text-[#999] italic">Locked</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto thin-scrollbar">
                    <table className="w-full min-w-[400px] border-collapse text-left text-[14px] table-fixed">
                      <thead>
                        <tr>
                          {user.role !== 'employee' && <th className={`w-1/4 p-3 border-b-2 ${headerBgTheme} ${borderTheme} ${textTheme}`}>User ID</th>}
                          {user.role !== 'employee' && <th className={`w-[15%] p-3 border-b-2 ${headerBgTheme} ${borderTheme} ${textTheme}`}>Role</th>}
                          {user.role === 'admin' && <th className={`w-[15%] p-3 border-b-2 ${headerBgTheme} ${borderTheme} ${textTheme}`}>Department</th>}
                          <th className={`w-1/4 p-3 border-b-2 ${headerBgTheme} ${borderTheme} ${textTheme}`}>Status</th>
                          <th className={`w-1/5 p-3 border-b-2 ${headerBgTheme} ${borderTheme} ${textTheme}`}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupedDashboardData[dateKey].map((record, idx) => (
                          <tr key={idx} className={`transition-colors ${isDarkMode ? 'hover:bg-[#252525]' : 'hover:bg-[#fafafa]'}`}>
                            {user.role !== 'employee' && <td className={`p-3 border-b break-all ${borderTheme} ${subTextTheme}`}>{record.userId}</td>}
                            {user.role !== 'employee' && <td className={`p-3 border-b ${borderTheme} ${subTextTheme}`}>{record.role?.toUpperCase() || 'N/A'}</td>}
                            {user.role === 'admin' && <td className={`p-3 border-b ${borderTheme} ${subTextTheme}`}>{record.department}</td>}
                            <td className={`p-3 border-b ${borderTheme} ${subTextTheme}`}>
                              <div className="flex items-center gap-2">
                                <span className={`py-1 px-2 rounded-[4px] text-[11px] font-bold ${record.attendance === 'present' ? 'bg-[#e8f5e9] text-[#2e7d32]' : 'bg-[#ffebee] text-[#c62828]'}`}>{record.attendance?.toUpperCase()}</span>
                                {record.rectified && <span className={`text-[10px] py-[2px] px-1.5 rounded-[4px] border ${isDarkMode ? 'text-[#bbb] bg-[#444] border-[#555]' : 'text-[#666] bg-[#e0e0e0] border-[#ccc]'}`}>RECTIFIED</span>}
                              </div>
                            </td>
                            <td className={`p-3 border-b ${borderTheme} ${subTextTheme}`}>
                              {(user.role === 'manager' || user.role === 'admin') ? (
                                <select className={`py-1.5 px-2 rounded-[4px] border outline-none ${isDarkMode ? 'bg-[#1e1e1e] text-[#e0e0e0] border-[#333]' : 'bg-white text-[#111] border-[#ccc]'}`} value={record.attendance} onChange={(e) => handleEditAttendance(record.userId, record.date, e.target.value)}>
                                  <option value="present">Present</option><option value="absent">Absent</option>
                                </select>
                              ) : (
                                <span className="text-[12px] text-[#999] italic">Locked</span>
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