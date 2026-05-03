import React, { useState, useEffect } from 'react';
import { connectionService, profileService } from '../services/api.js';
import type { Connection, User } from '../types/index.js';

export const ConnectionsPage: React.FC = () => {
  const [connections, setConnections] = useState<{ id: string; user?: User }[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadConnections();
    loadPendingRequests();
  }, []);

  const loadConnections = async () => {
    try {
      const conns = await connectionService.getConnections();
      // Load user info for each connection
      const connectionsWithInfo = await Promise.all(
        conns.map(async (conn) => {
          try {
            const user = await profileService.getUser(conn.id);
            return { id: conn.id, user };
          } catch {
            return { id: conn.id };
          }
        })
      );
      setConnections(connectionsWithInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load connections');
    }
  };

  const loadPendingRequests = async () => {
    try {
      const requests = await connectionService.getPendingRequests();
      setPendingRequests(requests);
    } catch (err) {
      console.error('Failed to load pending requests:', err);
    } finally {
      setLoading(false);
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
              <div key={req.id} style={requestCardStyle}>
                <div>
                  <h3>Connection Request</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                    Received {new Date(req.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div style={requestActionsStyle}>
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
              <div key={conn.id} style={connectionCardStyle}>
                <div style={{ flex: 1 }}>
                  <h3>{conn.user?.username || 'User'}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>{conn.user?.first_name}</p>
                </div>
                <button onClick={() => handleDisconnect(conn.id)} style={disconnectButtonStyle}>
                  Disconnect
                </button>
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

const disconnectButtonStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  backgroundColor: '#6c757d',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

const errorStyle: React.CSSProperties = {
  backgroundColor: '#451616',
  color: '#f8d7da',
  padding: '1rem',
  borderRadius: '8px',
  marginBottom: '1rem',
};
