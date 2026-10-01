import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectionService, profileService } from '../services/api.js';
import { useWebSocket } from '../hooks/useWebSocket.js';
import type { User } from '../types';
import { Btn } from '../components/Btn.tsx';
import { LoadingScreen } from '../components/Loadingscreen.tsx';

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

  useEffect(() => {
    if (isConnected) {
      loadConnections();
      loadPendingRequests();
    }
  }, [isConnected]);

  useEffect(() => {
    const updateOnline = (userId: string, online: boolean) => {
      setConnections((prev) => prev.map((c) => (c.user?.id === userId ? { ...c, user: { ...c.user!, isOnline: online } } : c)));
      setPendingRequests((prev) => prev.map((r) => (r.user?.id === userId ? { ...r, user: { ...r.user!, isOnline: online } } : r)));
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

  const handleAccept = async (id: string) => {
    try {
      await connectionService.acceptConnection(id);
      await loadPendingRequests();
      await loadConnections();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await connectionService.rejectConnection(id);
      await loadPendingRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject');
    }
  };

  const handleDisconnect = async (id: string) => {
    try {
      await connectionService.deleteConnection(id);
      await loadConnections();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect');
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="w-full min-h-[calc(100vh-60px)] py-10 px-4">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        {/* ── Page title ── */}
        <div className="border-2 border-border bg-panel px-6 py-5">
          <h1 className="text-2xl font-bold text-text mb-1" style={{ fontFamily: 'var(--font-ui)' }}>
            Connections
          </h1>
          <p className="text-muted text-sm" style={{ fontFamily: 'var(--font-ui)' }}>
            Friends, dates, and everyone in between
          </p>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="border-2 border-red bg-red/10 px-5 py-3 text-red text-sm" style={{ fontFamily: 'var(--font-ui)' }}>
            ✕ {error}
          </div>
        )}

        {/* ── Pending requests ── */}
        {pendingRequests.length > 0 && (
          <Panel label="Pending Requests" count={pendingRequests.length}>
            {pendingRequests.map((req) => (
              <UserRow key={req.id} user={req.user} sub="Wants to connect with you">
                <Btn variant="accept" onClick={() => handleAccept(req.id)}>
                  ✓ Accept
                </Btn>
                <Btn variant="reject" onClick={() => handleReject(req.id)}>
                  ✕ Reject
                </Btn>
              </UserRow>
            ))}
          </Panel>
        )}

        {/* Connections */}
        <Panel label="Your Connections" count={connections.length}>
          {connections.length === 0 ? (
            <div className="px-6 py-12 flex flex-col items-center gap-4 text-center">
              <span className="text-5xl">🤝</span>
              <p className="text-text font-bold text-base" style={{ fontFamily: 'var(--font-ui)' }}>
                No connections yet
              </p>
              <p className="text-muted text-sm max-w-xs" style={{ fontFamily: 'var(--font-ui)' }}>
                Head to Discover to find people with shared interests
              </p>
              <Btn variant="cta" onClick={() => navigate('/recommendations')}>
                ▶ Find Matches
              </Btn>
            </div>
          ) : (
            connections.map((conn) => (
              <UserRow key={conn.id} user={conn.user} sub={conn.user?.isOnline ? '● Online' : '○ Offline'} onlineColor={conn.user?.isOnline}>
                <Btn variant="ghost" onClick={() => navigate(`/users/${conn.id}`)}>
                  Profile
                </Btn>
                <Btn variant="primary" onClick={() => navigate(`/chat/${conn.id}`)}>
                  Chat
                </Btn>
                <Btn variant="reject" onClick={() => handleDisconnect(conn.id)}>
                  Remove
                </Btn>
              </UserRow>
            ))
          )}
        </Panel>
      </div>
    </div>
  );
};

// Panel ─────────────────────────────────────────────────────────────────────

const Panel: React.FC<{ label: string; count: number; children: React.ReactNode }> = ({ label, count, children }) => (
  <div className="border-2 border-border">
    {/* panel header bar */}
    <div className="flex items-center justify-between bg-surface border-b-2 border-border px-5 py-2">
      <span className="text-yellow font-bold text-sm uppercase tracking-wider" style={{ fontFamily: 'var(--font-ui)' }}>
        {label}
      </span>
      <span className="bg-bg border border-border text-muted text-xs font-bold px-2 py-0.5 tabular-nums" style={{ fontFamily: 'var(--font-ui)' }}>
        {count}
      </span>
    </div>
    {/* rows */}
    <div className="bg-panel divide-y divide-border">{children}</div>
  </div>
);

// UserRow ───────────────────────────────────────────────────────────────────

const UserRow: React.FC<{
  user?: User;
  sub: string;
  onlineColor?: boolean;
  children: React.ReactNode;
}> = ({ user, sub, onlineColor, children }) => (
  <div className="flex flex-wrap items-center gap-4 px-5 py-4 hover:bg-surface transition-colors">
    {/* avatar */}
    <div className="relative shrink-0">
      {user?.profilePicture ? (
        <img src={user.profilePicture} alt={user.name} className="w-12 h-12 object-cover border border-border" />
      ) : (
        <div
          className="w-12 h-12 bg-surface border border-border flex items-center justify-center text-yellow font-black text-lg"
          style={{ fontFamily: 'var(--font-ui)' }}
        >
          {user?.name?.charAt(0) ?? '?'}
        </div>
      )}
      {user?.isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green border-2 border-panel" />}
    </div>

    {/* name + status */}
    <div className="flex-1 min-w-0">
      <p className="text-text font-bold text-base truncate" style={{ fontFamily: 'var(--font-ui)' }}>
        {user?.name || 'User'}
      </p>
      <p className={`text-sm mt-0.5 truncate ${onlineColor ? 'text-green' : 'text-muted'}`} style={{ fontFamily: 'var(--font-ui)' }}>
        {sub}
      </p>
    </div>

    {/* action buttons */}
    <div className="flex gap-2 shrink-0 flex-wrap">{children}</div>
  </div>
);
