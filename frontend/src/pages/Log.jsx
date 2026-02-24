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
              
              {/* Public Routes - If logged in, force them to Dashboard */}
              <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login setToken={setToken} />} />
              <Route path="/signup" element={token ? <Navigate to="/" replace /> : <Signup />} />
              
              {/* Protected Routes - If NOT logged in, force them to Login */}
              <Route path="/" element={token ? <Dashboard /> : <Navigate to="/login" replace />} />
              <Route path="/settings" element={token ? <Settings /> : <Navigate to="/login" replace />} />
              <Route path="/log" element={token ? <Log /> : <Navigate to="/login" replace />} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to={token ? "/" : "/login"} replace />} />
              
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;