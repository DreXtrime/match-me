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
  const { on, off } = useWebSocket();

  useEffect(() => {
    Promise.all([loadConnections(), loadPendingRequests()]).finally(() => setLoading(false));
  }, []);

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

  if (loading) return <div style={containerStyle}>Loading connections...</div>;

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        {error && <div style={errorStyle}>{error}</div>}

        {pendingRequests.length > 0 && (
          <div style={sectionStyle}>
            <h2>Pending Requests ({pendingRequests.length})</h2>
            {pendingRequests.map((req) => (
              <div key={req.id} className="mobile-stack" style={requestCardStyle}>
                <div>
                  <h3>{req.user?.name || 'User'}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Wants to connect with you</p>
                </div>
                <div className="mobile-grow-buttons" style={requestActionsStyle}>
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
        )}

        <div style={sectionStyle}>
          <h2>Your Connections ({connections.length})</h2>
          {connections.length === 0 ? (
            <p>No connections yet. Start by discovering new people!</p>
          ) : (
            connections.map((conn) => (
              <div key={conn.id} className="mobile-stack" style={connectionCardStyle}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ margin: 0 }}>{conn.user?.name || 'User'}</h3>
                  <span style={onlineDotStyle(conn.user?.isOnline || false)} title={conn.user?.isOnline ? 'Online' : 'Offline'} />
                </div>
                <div className="mobile-grow-buttons" style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => navigate(`/users/${conn.id}`)} style={profileButtonStyle}>
                    Profile
                  </button>
                  <button onClick={() => navigate(`/chat/${conn.id}`)} style={chatButtonStyle}>
                    Chat
                  </button>
                  <button onClick={() => handleDisconnect(conn.id)} style={disconnectButtonStyle}>
                    Disconnect
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  minHeight: 'calc(100vh - 60px)',
  backgroundColor: 'var(--background)',
  padding: '2rem 1rem',
};

const contentStyle: React.CSSProperties = {
  maxWidth: '800px',
  margin: '0 auto',
};

const sectionStyle: React.CSSProperties = {
  marginBottom: '2rem',
};

const requestCardStyle: React.CSSProperties = {
  backgroundColor: 'var(--surface)',
  padding: '1rem',
  borderRadius: '16px',
  marginBottom: '1rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxShadow: 'var(--shadow)',
};

const requestActionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0.5rem',
};

const connectionCardStyle: React.CSSProperties = {
  backgroundColor: 'var(--surface)',
  padding: '1rem',
  borderRadius: '16px',
  marginBottom: '1rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxShadow: 'var(--shadow)',
};

const acceptButtonStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  backgroundColor: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

const rejectButtonStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  backgroundColor: '#dc3545',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

const profileButtonStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  backgroundColor: 'transparent',
  color: 'var(--primary)',
  border: '1px solid var(--primary)',
  borderRadius: '4px',
  cursor: 'pointer',
};

const chatButtonStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  backgroundColor: 'var(--primary)',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

const disconnectButtonStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  backgroundColor: '#6c757d',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

const onlineDotStyle = (isOnline: boolean): React.CSSProperties => ({
  display: 'inline-block',
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  backgroundColor: isOnline ? '#44d190' : '#9bb2d6',
  flexShrink: 0,
});

const errorStyle: React.CSSProperties = {
  backgroundColor: '#451616',
  color: '#f8d7da',
  padding: '1rem',
  borderRadius: '8px',
  marginBottom: '1rem',
};
