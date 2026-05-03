import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { messageService, profileService } from '../services/api.js';
import type { Chat, User } from '../types/index.js';

export const ChatsPage: React.FC = () => {
  const [chats, setChats] = useState<Array<Chat & { user?: User }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setLoading(true);
      const chatsData = await messageService.getChats();
      const chatsWithInfo = await Promise.all(
        chatsData.map(async (chat) => {
          try {
            const user = await profileService.getUser(chat.id);
            return { ...chat, user };
          } catch {
            return chat;
          }
        })
      );
      setChats(chatsWithInfo as Array<Chat & { user?: User }>);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={containerStyle}>Loading chats...</div>;

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <h1>Your Chats</h1>
        {error && <div style={errorStyle}>{error}</div>}

        {chats.length === 0 ? (
          <p>No chats yet. Connect with someone and start chatting!</p>
        ) : (
          <div style={chatsListStyle}>
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => navigate(`/chat/${chat.id}`)}
                style={chatItemStyle}
              >
                <div>
                  <h3>{chat.user?.first_name || chat.user?.username || `User ${chat.id.substring(0, 8)}`}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                    {new Date(chat.lastMessageTime).toLocaleDateString()} • {chat.user?.is_online ? 'Online' : 'Offline'}
                  </p>
                </div>
                <span style={{ fontSize: '1.2rem' }}>→</span>
              </div>
            ))}
          </div>
        )}
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

const chatsListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const chatItemStyle: React.CSSProperties = {
  backgroundColor: 'var(--surface)',
  padding: '1rem',
  borderRadius: '16px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  cursor: 'pointer',
  boxShadow: 'var(--shadow)',
  transition: 'transform 0.2s',
};

const errorStyle: React.CSSProperties = {
  backgroundColor: '#451616',
  color: '#f8d7da',
  padding: '1rem',
  borderRadius: '8px',
  marginBottom: '1rem',
};
