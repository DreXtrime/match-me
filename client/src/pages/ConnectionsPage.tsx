import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectionService, profileService } from '../services/api.js';
import { useWebSocket } from '../hooks/useWebSocket.js';
import type { User } from '../types/index.js';

type UserEntry = { id: string; user?: User };

export const ConnectionsPage: React.FC = () => {
  const [connections, setConnections] = useState<UserEntry[]>([]);
  const [pendingRequests, setPendingRequests] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { on, off, isConnected } = useWebSocket();

  useEffect(() => {
    Promise.all([loadConnections(), loadPendingRequests()]).finally(() => setLoading(false));
  }, []);

  // Re-fetch when tab becomes visible again (catches missed WS events while backgrounded)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadConnections();
        loadPendingRequests();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Re-fetch whenever the WebSocket reconnects (catches missed events during a network blip)
  useEffect(() => {
    if (isConnected) {
      loadConnections();
      loadPendingRequests();
    }
  }, [isConnected]);

  useEffect(() => {
    const updateOnline = (userId: string, online: boolean) => {
      setConnections(prev => prev.map(c =>
        c.user?.id === userId ? { ...c, user: { ...c.user!, isOnline: online } } : c
      ));
      setPendingRequests(prev => prev.map(r =>
        r.user?.id === userId ? { ...r, user: { ...r.user!, isOnline: online } } : r
      ));
    };
    const handleOnline = (id: string) => updateOnline(id, true);
    const handleOffline = (id: string) => updateOnline(id, false);

    on('user-online', handleOnline);
    on('user-offline', handleOffline);
    return () => {
      off('user-online', handleOnline);
      off('user-offline', handleOffline);
    };
  }, [on, off]);

  const loadConnections = async () => {
    try {
      const ids = await connectionService.getConnections();
      const withInfo = await Promise.all(
        ids.map(async (id) => {
          try {
            const user = await profileService.getUser(id);
            return { id, user };
          } catch {
            return { id };
          }
        })
      );
      setConnections(withInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load connections');
    }
  };

  const loadPendingRequests = async () => {
    try {
      const ids = await connectionService.getPendingRequests();
      const withInfo = await Promise.all(
        ids.map(async (id) => {
          try {
            const user = await profileService.getUser(id);
            return { id, user };
          } catch {
            return { id };
          }
        })
      );
      setPendingRequests(withInfo);
    } catch (err) {
      console.error('Failed to load pending requests:', err);
    }
  };

  const handleAccept = async (connectionId: string) => {
    try {
      await connectionService.acceptConnection(connectionId);
      await loadPendingRequests();
      await loadConnections();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept request');
    }
  };

  const handleReject = async (connectionId: string) => {
    try {
      await connectionService.rejectConnection(connectionId);
      await loadPendingRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject request');
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    try {
      await connectionService.deleteConnection(connectionId);
      await loadConnections();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect');
    }
  };

  const renderAvatar = (user?: User) => (
    <div style={avatarWrapStyle}>
      {user?.profilePicture ? (
        <img src={user.profilePicture} alt={user.name} style={avatarStyle} />
      ) : (
        <div style={avatarPlaceholderStyle}>{user?.name?.charAt(0) ?? '?'}</div>
      )}
      {user?.isOnline && <span style={onlineBadgeStyle} />}
    </div>
  );

  if (loading) {
    return (
      <div className="mobile-compact-pad" style={containerStyle}>
        <div style={loadingStyle}>Loading connections…</div>
      </div>
    );
  }

  return (
    <div className="mobile-compact-pad" style={containerStyle}>
      <div style={contentStyle}>
        <header style={headerSectionStyle}>
          <h1 style={titleStyle}>Connections</h1>
          <p style={subtitleStyle}>Friends, dates, and everyone in between</p>
        </header>

        {error && <div style={errorStyle}>{error}</div>}

        {pendingRequests.length > 0 && (
          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>
              Pending Requests <span style={countBadgeStyle}>{pendingRequests.length}</span>
            </h2>
            <div style={listStyle}>
              {pendingRequests.map((req) => (
                <div key={req.id} className="mobile-stack" style={cardStyle}>
                  <div style={userBlockStyle}>
                    {renderAvatar(req.user)}
                    <div>
                      <h3 style={nameStyle}>{req.user?.name || 'User'}</h3>
                      <p style={subtleStyle}>Wants to connect with you</p>
                    </div>
                  </div>
                  <div className="mobile-grow-buttons" style={actionsStyle}>
                    <button onClick={() => handleAccept(req.id)} style={acceptButtonStyle}>
                      ✓ Accept
                    </button>
                    <button onClick={() => handleReject(req.id)} style={rejectButtonStyle}>
                      ✕ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>
            Your Connections <span style={countBadgeStyle}>{connections.length}</span>
          </h2>
          {connections.length === 0 ? (
            <div style={emptyStateStyle}>
              <div style={emptyIconStyle}>🤝</div>
              <p style={emptyTextStyle}>No connections yet</p>
              <p style={emptySubtextStyle}>Head to Discover to find people with shared interests</p>
              <button onClick={() => navigate('/recommendations')} style={ctaButtonStyle}>
                Find Matches
              </button>
            </div>
          ) : (
            <div style={listStyle}>
              {connections.map((conn) => (
                <div key={conn.id} className="mobile-stack" style={cardStyle}>
                  <div style={userBlockStyle}>
                    {renderAvatar(conn.user)}
                    <div>
                      <h3 style={nameStyle}>{conn.user?.name || 'User'}</h3>
                      <p style={subtleStyle}>{conn.user?.isOnline ? '🟢 Online now' : '🔘 Offline'}</p>
                    </div>
                  </div>
                  <div className="mobile-grow-buttons" style={actionsStyle}>
                    <button onClick={() => navigate(`/users/${conn.id}`)} style={profileButtonStyle}>
                      Profile
                    </button>
                    <button onClick={() => navigate(`/chat/${conn.id}`)} style={chatButtonStyle}>
                      Chat
                    </button>
                    <button onClick={() => handleDisconnect(conn.id)} style={disconnectButtonStyle}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

// ============================================================================
// Styles
// ============================================================================

const containerStyle: React.CSSProperties = {
  minHeight: 'calc(100vh - 60px)',
  backgroundColor: 'var(--background)',
  padding: '2rem 1rem',
};

const contentStyle: React.CSSProperties = {
  maxWidth: '800px',
  margin: '0 auto',
};

const headerSectionStyle: React.CSSProperties = {
  marginBottom: '2rem',
  paddingBottom: '1.5rem',
  borderBottom: '1px solid var(--border)',
};

const titleStyle: React.CSSProperties = {
  margin: '0 0 0.5rem 0',
  fontSize: '2rem',
  fontWeight: 700,
  color: 'var(--text)',
};

const subtitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.95rem',
  color: 'var(--muted)',
};

const sectionStyle: React.CSSProperties = {
  marginBottom: '2.5rem',
};

const sectionTitleStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.6rem',
  margin: '0 0 1rem 0',
  fontSize: '0.85rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--muted)',
};

const countBadgeStyle: React.CSSProperties = {
  backgroundColor: 'var(--primary-soft)',
  color: 'var(--primary)',
  padding: '0.15rem 0.55rem',
  borderRadius: '999px',
  fontSize: '0.75rem',
  fontWeight: 700,
};

const listStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.875rem',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: 'var(--surface)',
  border: '1px solid var(--border)',
  padding: '1rem 1.25rem',
  borderRadius: '16px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '1rem',
  transition: 'all 0.25s ease',
};

const userBlockStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  flex: 1,
  minWidth: 0,
};

const avatarWrapStyle: React.CSSProperties = {
  position: 'relative',
  flexShrink: 0,
};

const avatarStyle: React.CSSProperties = {
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: '2px solid var(--primary)',
};

const avatarPlaceholderStyle: React.CSSProperties = {
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  backgroundColor: 'var(--primary-soft)',
  color: 'var(--primary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.3rem',
  fontWeight: 700,
  border: '2px solid var(--primary)',
};

const onlineBadgeStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 0,
  right: 0,
  width: '14px',
  height: '14px',
  borderRadius: '50%',
  backgroundColor: 'var(--success)',
  border: '2px solid var(--surface)',
};

const nameStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '1.05rem',
  fontWeight: 600,
  color: 'var(--text)',
};

const subtleStyle: React.CSSProperties = {
  margin: '0.2rem 0 0 0',
  fontSize: '0.85rem',
  color: 'var(--muted)',
};

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0.5rem',
  flexShrink: 0,
};

const baseButton: React.CSSProperties = {
  padding: '0.55rem 1.1rem',
  borderRadius: '12px',
  fontSize: '0.875rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const acceptButtonStyle: React.CSSProperties = {
  ...baseButton,
  background: 'linear-gradient(135deg, var(--success), #2cb478)',
  color: 'white',
  border: 'none',
  boxShadow: '0 6px 18px rgba(68, 209, 144, 0.25)',
};

const rejectButtonStyle: React.CSSProperties = {
  ...baseButton,
  background: 'rgba(247, 105, 105, 0.12)',
  color: 'var(--danger)',
  border: '1px solid rgba(247, 105, 105, 0.4)',
};

const profileButtonStyle: React.CSSProperties = {
  ...baseButton,
  background: 'rgba(124, 152, 255, 0.15)',
  color: 'white',
  border: '1px solid var(--primary)',
};

const chatButtonStyle: React.CSSProperties = {
  ...baseButton,
  background: 'rgba(124, 152, 255, 0.15)',
  color: 'white',
  border: '1px solid var(--primary)',
};

const disconnectButtonStyle: React.CSSProperties = {
  ...baseButton,
  background: 'rgba(124, 152, 255, 0.15)',
  color: 'white',
  border: '1px solid var(--primary)',
};

const emptyStateStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '3rem 2rem',
  textAlign: 'center',
  backgroundColor: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '16px',
};

const emptyIconStyle: React.CSSProperties = {
  fontSize: '3rem',
  marginBottom: '1rem',
};

const emptyTextStyle: React.CSSProperties = {
  fontSize: '1.15rem',
  fontWeight: 600,
  color: 'var(--text)',
  margin: '0 0 0.5rem 0',
};

const emptySubtextStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  color: 'var(--muted)',
  margin: '0 0 1.5rem 0',
};

const ctaButtonStyle: React.CSSProperties = {
  ...baseButton,
  padding: '0.75rem 1.75rem',
  background: 'linear-gradient(135deg, var(--primary), #536dff)',
  color: 'white',
  border: 'none',
  boxShadow: '0 8px 24px rgba(124, 152, 255, 0.3)',
};

const loadingStyle: React.CSSProperties = {
  textAlign: 'center',
  color: 'var(--muted)',
  fontSize: '1rem',
  paddingTop: '4rem',
};

const errorStyle: React.CSSProperties = {
  backgroundColor: 'rgba(247, 105, 105, 0.1)',
  border: '1px solid rgba(247, 105, 105, 0.3)',
  color: '#f8d7da',
  padding: '1rem',
  borderRadius: '12px',
  marginBottom: '1.5rem',
};
