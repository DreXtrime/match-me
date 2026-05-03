import React from 'react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  isAuthenticated: boolean;
  unreadCount?: number;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isAuthenticated, unreadCount = 0, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    onLogout?.();
    navigate('/login');
  };

  return (
    <nav style={{ background: 'rgba(14, 22, 38, 0.96)', color: 'var(--text)', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.18)' }}>
      <h1 style={{ margin: 0, cursor: 'pointer', fontWeight: 700, letterSpacing: '-0.03em' }} onClick={() => navigate('/') }>
        ❤️ Match-Me
      </h1>

      {isAuthenticated ? (
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <button onClick={() => navigate('/')} style={navButtonStyle}>
            Dashboard
          </button>
          <button onClick={() => navigate('/recommendations')} style={navButtonStyle}>
            Discover
          </button>
          <button onClick={() => navigate('/chats')} style={navButtonStyle}>
            💬 Messages {unreadCount > 0 && <span style={{ color: 'red' }}>({unreadCount})</span>}
          </button>
          <button onClick={() => navigate('/connections')} style={navButtonStyle}>
            Connections
          </button>
          <button onClick={() => navigate('/profile')} style={navButtonStyle}>
            Profile
          </button>
          <button onClick={handleLogout} style={{ ...navButtonStyle, backgroundColor: '#c72c2c' }}>
            Logout
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => navigate('/login')} style={navButtonStyle}>
            Login
          </button>
          <button onClick={() => navigate('/register')} style={navButtonStyle}>
            Sign Up
          </button>
        </div>
      )}
    </nav>
  );
};

const navButtonStyle: React.CSSProperties = {
  backgroundColor: 'transparent',
  color: 'var(--text)',
  border: '1px solid rgba(255,255,255,0.12)',
  padding: '0.65rem 1rem',
  cursor: 'pointer',
  fontSize: '1rem',
  transition: 'transform 0.2s ease, border-color 0.2s',
  borderRadius: '12px',
};
