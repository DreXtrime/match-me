import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { messageService, profileService } from '../services/api.js';
import { useWebSocket } from '../hooks/useWebSocket.js';
import type { Chat, User } from '../types/index.js';

export const ChatsPage: React.FC = () => {
  const [chats, setChats] = useState<Array<Chat & { user?: User; lastMessage?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { on, off } = useWebSocket();

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    const handleNewMessage = () => loadChats();
    const handleUnreadUpdate = () => loadChats();
    const handleUserOnline = (userId: string) => {
      setChats(prev => prev.map(chat =>
        chat.user?.id === userId ? { ...chat, user: { ...chat.user!, isOnline: true } } : chat
      ));
    };
    const handleUserOffline = (userId: string) => {
      setChats(prev => prev.map(chat =>
        chat.user?.id === userId ? { ...chat, user: { ...chat.user!, isOnline: false } } : chat
      ));
    };

    on('new-message', handleNewMessage);
    on('unread-update', handleUnreadUpdate);
    on('user-online', handleUserOnline);
    on('user-offline', handleUserOffline);

    return () => {
      off('new-message', handleNewMessage);
      off('unread-update', handleUnreadUpdate);
      off('user-online', handleUserOnline);
      off('user-offline', handleUserOffline);
    };
  }, [on, off]);

  const loadChats = async () => {
    try {
      setLoading(true);
      const chatsData = await messageService.getChats();
      
      const chatsWithInfo = await Promise.all(
        chatsData.map(async (chat) => {
          try {
            const user = await profileService.getUser(chat.id);
            return { ...chat, user };
          } catch (err) {
            console.error(`Failed to load user ${chat.id}:`, err);
            return chat;
          }
        })
      );

      // Sort by lastMessageTime
      chatsWithInfo.sort((a, b) => {
        const timeA = new Date(a.lastMessageTime).getTime();
        const timeB = new Date(b.lastMessageTime).getTime();
        return timeB - timeA;
      });

      setChats(chatsWithInfo as Array<Chat & { user?: User }>);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chats');
      console.error('Error loading chats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={loadingStyle}>Loading chats...</div>
      </div>
    );
  }

  return (
    <div className="mobile-compact-pad" style={containerStyle}>
      <div style={contentStyle}>
        <div style={headerSectionStyle}>
          <h1 style={titleStyle}>Messages</h1>
          <p style={subtitleStyle}>Connect with your matches</p>
        </div>

        {error && <div style={errorStyle}>{error}</div>}

        {chats.length === 0 ? (
          <div style={emptyStateStyle}>
            <div style={emptyIconStyle}>💬</div>
            <p style={emptyTextStyle}>No chats yet</p>
            <p style={emptySubtextStyle}>Connect with someone and start chatting!</p>
            <button onClick={() => navigate('/recommendations')} style={ctaButtonStyle}>
              Find Matches
            </button>
          </div>
        ) : (
          <div style={chatsListStyle}>
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => navigate(`/chat/${chat.id}`)}
                style={chatItemStyle}
              >
                <div style={chatAvatarStyle}>
                  {chat.user?.profilePicture ? (
                    <img
                      src={chat.user.profilePicture}
                      alt={chat.user.name}
                      style={avatarImageStyle}
                    />
                  ) : (
                    <div style={avatarPlaceholderStyle}>
                      {chat.user?.name?.charAt(0) || '?'}
                    </div>
                  )}
                  {chat.user?.isOnline && <div style={onlineBadgeStyle} />}
                </div>

                <div style={chatInfoStyle}>
                  <div style={chatHeaderStyle}>
                    <h3 style={chatNameStyle}>
                      {chat.user?.name || `User ${chat.id.substring(0, 8)}`}
                    </h3>
                    <span style={timeStyle}>
                      {formatTime(new Date(chat.lastMessageTime))}
                    </span>
                  </div>
                  <p style={statusStyle}>
                    {chat.user?.isOnline ? '🟢 Online' : '🔘 Offline'}
                  </p>
                </div>

                <div style={arrowStyle}>→</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function formatTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const containerStyle: React.CSSProperties = {
  minHeight: 'calc(100vh - 60px)',
  backgroundColor: 'var(--background)',
  padding: '2rem 1rem',
};

const contentStyle: React.CSSProperties = {
  maxWidth: '700px',
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

const loadingStyle: React.CSSProperties = {
  color: 'var(--muted)',
  fontSize: '1.1rem',
  textAlign: 'center',
  padding: '3rem 0',
};

const chatsListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const chatItemStyle: React.CSSProperties = {
  backgroundColor: 'var(--surface)',
  padding: '1.25rem',
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  cursor: 'pointer',
  border: '1px solid var(--border)',
  transition: 'all 0.3s ease',
};

const chatAvatarStyle: React.CSSProperties = {
  position: 'relative',
  flexShrink: 0,
};

const avatarImageStyle: React.CSSProperties = {
  width: '56px',
  height: '56px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: '2px solid var(--primary)',
};

const avatarPlaceholderStyle: React.CSSProperties = {
  width: '56px',
  height: '56px',
  borderRadius: '50%',
  backgroundColor: 'var(--primary-soft)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.5rem',
  fontWeight: 700,
  border: '2px solid var(--primary)',
};

const onlineBadgeStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 0,
  right: 0,
  width: '16px',
  height: '16px',
  borderRadius: '50%',
  backgroundColor: '#44d190',
  border: '3px solid var(--surface)',
};

const chatInfoStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
};

const chatHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  marginBottom: '0.35rem',
  gap: '1rem',
};

const chatNameStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '1rem',
  fontWeight: 600,
  color: 'var(--text)',
};

const timeStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  color: 'var(--muted)',
  whiteSpace: 'nowrap',
};

const statusStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.85rem',
  color: 'var(--muted)',
};

const arrowStyle: React.CSSProperties = {
  fontSize: '1.2rem',
  color: 'var(--primary)',
  flexShrink: 0,
};

const emptyStateStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4rem 2rem',
  textAlign: 'center',
};

const emptyIconStyle: React.CSSProperties = {
  fontSize: '3.5rem',
  marginBottom: '1rem',
};

const emptyTextStyle: React.CSSProperties = {
  fontSize: '1.2rem',
  fontWeight: 600,
  color: 'var(--text)',
  margin: '0 0 0.5rem 0',
};

const emptySubtextStyle: React.CSSProperties = {
  fontSize: '0.95rem',
  color: 'var(--muted)',
  margin: '0 0 2rem 0',
};

const ctaButtonStyle: React.CSSProperties = {
  padding: '0.875rem 2rem',
  backgroundColor: 'linear-gradient(135deg, var(--primary), #536dff)',
  color: 'white',
  border: 'none',
  borderRadius: '20px',
  fontSize: '0.95rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'transform 0.2s ease, opacity 0.2s ease',
};

const errorStyle: React.CSSProperties = {
  backgroundColor: 'rgba(247, 105, 105, 0.1)',
  color: '#f8d7da',
  padding: '1rem',
  marginBottom: '1.5rem',
  borderRadius: '12px',
  border: '1px solid rgba(247, 105, 105, 0.3)',
};
