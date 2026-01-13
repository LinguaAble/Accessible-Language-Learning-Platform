import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 1. Remove the "ID Card" (Token) from BOTH storages
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');

    // 2. Send user back to Login
    navigate('/');
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>My Dashboard</h1>
      <p>Welcome! Your distraction-free learning space is ready.</p>

      <button
        onClick={handleLogout}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          background: '#e74c3c', // Red color for logout
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Sign Out
      </button>
    </div>
  );
};

export default Dashboard;