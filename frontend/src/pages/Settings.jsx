import React, { useState, useEffect } from 'react';

const Settings = () => {
  const [userData, setUserData] = useState({ userName: '', email: '', role: '', department: '' });

  // Fetch user info from the token to make the dummy page look realistic
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserData({
          userName: payload.userName || '',
          email: payload.email || '',
          role: payload.role || '',
          department: payload.department || ''
        });
      } catch (e) {
        console.error("Failed to decode token");
      }
    }
  }, []);

  const styles = {
    container: {
      padding: '20px 40px',
      fontFamily: 'sans-serif',
      color: '#333',
      maxWidth: '800px',
      margin: '0 auto' // Centers the settings panel
    },
    header: {
      fontSize: '28px',
      fontWeight: 'bold',
      marginBottom: '20px',
      color: '#222'
    },
    banner: {
      backgroundColor: '#fff3cd',
      color: '#856404',
      padding: '15px',
      borderRadius: '6px',
      border: '1px solid #ffeeba',
      marginBottom: '30px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontWeight: 'bold'
    },
    section: {
      backgroundColor: '#fff',
      padding: '25px',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      marginBottom: '25px'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '15px',
      borderBottom: '1px solid #eee',
      paddingBottom: '10px'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      marginBottom: '15px'
    },
    label: {
      fontSize: '14px',
      fontWeight: 'bold',
      marginBottom: '5px',
      color: '#555'
    },
    input: {
      padding: '10px',
      borderRadius: '4px',
      border: '1px solid #ddd',
      backgroundColor: '#f9f9f9', // Light gray to show it's disabled
      color: '#888',
      fontSize: '15px',
      cursor: 'not-allowed' // Shows the universal "unusable" cursor
    },
    checkboxGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '10px',
      color: '#666',
      cursor: 'not-allowed'
    },
    button: {
      padding: '12px 25px',
      backgroundColor: '#cccccc', // Grayed out button
      color: '#666',
      border: 'none',
      borderRadius: '4px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'not-allowed',
      marginTop: '10px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>Settings</div>

      {/* Under Construction Banner */}
      <div style={styles.banner}>
        <span>🚧</span>
        <span>Notice: The settings page is currently under maintenance. Changes cannot be saved at this time.</span>
      </div>

      {/* Profile Section (Dummy) */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Profile Information</div>
        
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ ...styles.formGroup, flex: 1 }}>
            <label style={styles.label}>Username</label>
            <input style={styles.input} type="text" value={userData.userName} disabled />
          </div>
          <div style={{ ...styles.formGroup, flex: 1 }}>
            <label style={styles.label}>Email Address</label>
            <input style={styles.input} type="email" value={userData.email} disabled />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ ...styles.formGroup, flex: 1 }}>
            <label style={styles.label}>Role</label>
            <input style={styles.input} type="text" value={userData.role.toUpperCase()} disabled />
          </div>
          <div style={{ ...styles.formGroup, flex: 1 }}>
            <label style={styles.label}>Department</label>
            <input style={styles.input} type="text" value={userData.department} disabled />
          </div>
        </div>
      </div>

      {/* Preferences Section (Dummy) */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>System Preferences</div>
        
        <div style={styles.checkboxGroup}>
          <input type="checkbox" disabled checked />
          <label>Receive Email Notifications for Attendance Updates</label>
        </div>
        
        <div style={styles.checkboxGroup}>
          <input type="checkbox" disabled />
          <label>Enable Dark Mode (Beta)</label>
        </div>
      </div>

      {/* Disabled Save Button */}
      <button style={styles.button} disabled>
        Save Changes
      </button>

    </div>
  );
};

export default Settings;