import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  isAuthenticated: boolean;
  unreadCount?: number;
  pendingCount?: number;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isAuthenticated, unreadCount = 0, pendingCount = 0, onLogout }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    onLogout?.();
    navigate('/login');
  };

  return (
    <nav style={navStyle}>
      <div style={navContentStyle}>
        <div style={logoStyle} onClick={() => navigate('/')}>
          <span style={logoIconStyle}>💓</span>
          <span style={logoTextStyle}>Match-Me</span>
        </div>

        {isAuthenticated ? (
          <>
            <div className="nav-links" style={navLinksStyle}>
              <NavLink icon="🏠" label="Discover" onClick={() => navigate('/recommendations')} />
              <NavLink 
                icon="💬" 
                label="Messages" 
                badge={unreadCount}
                onClick={() => navigate('/chats')} 
              />
              <NavLink icon="🤝" label="Connections" badge={pendingCount} onClick={() => navigate('/connections')} />
              <NavLink icon="👤" label="Profile" onClick={() => navigate('/profile')} />
              <button onClick={handleLogout} style={logoutButtonStyle}>
                Logout
              </button>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-menu-toggle"
              style={mobileMenuToggleStyle}
            >
              ☰
            </button>
          </>
        ) : (
          <div style={authLinksStyle}>
            <button onClick={() => navigate('/login')} style={loginButtonStyle}>
              Login
            </button>
            <button onClick={() => navigate('/register')} style={signupButtonStyle}>
              Sign Up
            </button>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && isAuthenticated && (
        <div style={mobileMenuStyle}>
          <NavLink icon="🏠" label="Discover" onClick={() => { navigate('/recommendations'); setMobileMenuOpen(false); }} />
          <NavLink 
            icon="💬" 
            label="Messages" 
            badge={unreadCount}
            onClick={() => { navigate('/chats'); setMobileMenuOpen(false); }} 
          />
          <NavLink icon="🤝" label="Connections" badge={pendingCount} onClick={() => { navigate('/connections'); setMobileMenuOpen(false); }} />
          <NavLink icon="👤" label="Profile" onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }} />
          <button onClick={handleLogout} style={logoutButtonStyle}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

interface NavLinkProps {
  icon: string;
  label: string;
  badge?: number;
  onClick: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ icon, label, badge, onClick }) => (
  <button onClick={onClick} style={navLinkButtonStyle}>
    <span style={navIconStyle}>{icon}</span>
    <span>{label}</span>
    {badge && badge > 0 && (
      <span style={badgeStyle}>{badge}</span>
    )}
  </button>
);

// ============================================================================
// Styles
// ============================================================================

const navStyle: React.CSSProperties = {
  backgroundColor: 'rgba(8, 16, 29, 0.96)',
  borderBottom: '1px solid var(--border)',
  backdropFilter: 'blur(12px)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  position: 'sticky',
  top: 0,
  zIndex: 100,
};

const navContentStyle: React.CSSProperties = {
  maxWidth: '1400px',
  margin: '0 auto',
  padding: '1rem 2rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const logoStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  cursor: 'pointer',
  transition: 'opacity 0.2s ease',
};

const logoIconStyle: React.CSSProperties = {
  fontSize: '1.5rem',
};

const logoTextStyle: React.CSSProperties = {
  fontSize: '1.3rem',
  fontWeight: 700,
  background: 'linear-gradient(135deg, var(--primary), #a459ff)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

const navLinksStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0.5rem',
  alignItems: 'center',
};

const navLinkButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: 'var(--text)',
  padding: '0.625rem 1rem',
  fontSize: '0.9rem',
  fontWeight: 500,
  cursor: 'pointer',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  transition: 'all 0.3s ease',
};

const navIconStyle: React.CSSProperties = {
  fontSize: '1.1rem',
};

const badgeStyle: React.CSSProperties = {
  backgroundColor: '#f76969',
  color: 'white',
  fontSize: '0.7rem',
  padding: '0.125rem 0.375rem',
  borderRadius: '8px',
  fontWeight: 700,
  marginLeft: '0.25rem',
};

const logoutButtonStyle: React.CSSProperties = {
  ...navLinkButtonStyle,
  color: '#f76969',
  borderLeft: '1px solid var(--border)',
  paddingLeft: '1rem',
};

const authLinksStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0.75rem',
};

const loginButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid var(--primary)',
  color: 'var(--primary)',
  padding: '0.625rem 1.25rem',
  borderRadius: '12px',
  fontSize: '0.9rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
};

const signupButtonStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, var(--primary), #536dff)',
  border: 'none',
  color: 'white',
  padding: '0.625rem 1.25rem',
  borderRadius: '12px',
  fontSize: '0.9rem',
  fontWeight: 600,
  cursor: 'pointer',
  boxShadow: '0 8px 24px rgba(124, 152, 255, 0.3)',
  transition: 'all 0.3s ease',
};

const mobileMenuToggleStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--text)',
  fontSize: '1.5rem',
  cursor: 'pointer',
};

const mobileMenuStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  padding: '1rem 2rem',
  backgroundColor: 'rgba(17, 24, 39, 0.9)',
  borderTop: '1px solid var(--border)',
};
