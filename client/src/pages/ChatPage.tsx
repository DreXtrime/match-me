import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { messageService, profileService } from '../services/api.js';
import { useWebSocket } from '../hooks/useWebSocket.js';
import type { Message, User } from '../types/index.js';

interface NewMessagePayload {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface TypingPayload {
  userId: string;
}

export const ChatPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { socket, emit, on, off } = useWebSocket();
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const localUserId = localStorage.getItem('userId') ?? '';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!userId) return;
    loadMessages();
    loadOtherUserProfile();
  }, [userId]);

  useEffect(() => {
    if (!userId || !socket) return;

    const handleNewMessage = (data: NewMessagePayload) => {
      if (data.senderId === userId) {
        setMessages((prev: Message[]) => [
          ...prev,
          {
            id: data.id,
            sender_id: data.senderId,
            receiver_id: data.receiverId,
            content: data.content,
            is_read: data.isRead,
            created_at: data.createdAt,
          },
        ]);
      }
    };

    const handleUserTyping = (data: TypingPayload) => {
      if (data.userId === userId) setIsTyping(true);
    };

    const handleUserStoppedTyping = (data: TypingPayload) => {
      if (data.userId === userId) setIsTyping(false);
    };

    const handleUserOnline = (onlineUserId: string) => {
      if (onlineUserId === userId) setOtherUser((prev) => (prev ? { ...prev, isOnline: true } : prev));
    };

    const handleUserOffline = (offlineUserId: string) => {
      if (offlineUserId === userId) setOtherUser((prev) => (prev ? { ...prev, isOnline: false } : prev));
    };

    on('new-message', handleNewMessage);
    on('user-typing', handleUserTyping);
    on('user-stopped-typing', handleUserStoppedTyping);
    on('user-online', handleUserOnline);
    on('user-offline', handleUserOffline);

    return () => {
      off('new-message', handleNewMessage);
      off('user-typing', handleUserTyping);
      off('user-stopped-typing', handleUserStoppedTyping);
      off('user-online', handleUserOnline);
      off('user-offline', handleUserOffline);
    };
  }, [socket, userId, on, off]);

  const loadMessages = async () => {
    try {
      if (!userId) return;
      setLoading(true);
      const msgs = await messageService.getConversation(userId);
      setMessages(msgs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const loadOtherUserProfile = async () => {
    try {
      if (!userId) return;
      const user = await profileService.getUser(userId);
      setOtherUser(user);
    } catch (err) {
      console.error('Failed to load user profile:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId) return;

    try {
      const message = await messageService.sendMessage(userId, newMessage);
      setMessages((prev: Message[]) => [...prev, message]);
      setNewMessage('');

      // Stop typing indicator
      emit('user-stopped-typing', { receiverId: userId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  const handleTyping = () => {
    if (!userId) return;

    emit('user-typing', { receiverId: userId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      emit('user-stopped-typing', { receiverId: userId });
    }, 2000);
  };

  if (loading)
    return (
      <div style={containerStyle}>
        <div style={loadingStyle}>Loading chat...</div>
      </div>
    );

  if (!userId)
    return (
      <div style={containerStyle}>
        <div style={errorBoxStyle}>Chat not found</div>
      </div>
    );

  return (
    <div className="mobile-no-pad" style={containerStyle}>
      <div className="mobile-edge-card" style={chatBoxStyle}>
        <div className="mobile-compact-pad" style={headerStyle}>
          <div style={headerNameWrapStyle}>
            {otherUser?.profilePicture ? (
              <img src={otherUser.profilePicture} alt={otherUser.name} style={headerAvatarStyle} />
            ) : (
              <div style={headerAvatarPlaceholderStyle}>{otherUser?.name?.charAt(0) ?? '?'}</div>
            )}
            <div>
              <h2 style={headerTitleStyle}>{otherUser?.name || 'Chat'}</h2>
              <p style={onlineStatusStyle}>
                <span style={onlineDotStyle(otherUser?.isOnline || false)} />
                {otherUser?.isOnline ? 'Online now' : 'Offline'}
              </p>
            </div>
          </div>
          <button onClick={() => navigate('/chats')} style={backButtonStyle} aria-label="Back to chats">
            ←
          </button>
        </div>

        {error && <div style={errorStyle}>{error}</div>}

        <div style={messagesContainerStyle}>
          {messages.length === 0 ? (
            <div style={emptyStateStyle}>
              <p>No messages yet. Start the conversation! 💬</p>
            </div>
          ) : (
            <>
              <div style={{ flex: 1, minHeight: 0 }} />
              {messages.map((msg) => (
                <div key={msg.id} style={messageWrapperStyle(msg.sender_id === localUserId)}>
                  <div style={messageStyle(msg.sender_id === localUserId)}>
                    <p style={messageContentStyle}>{msg.content}</p>
                    <small style={messageTimeStyle}>{formatMessageTime(msg.created_at)}</small>
                  </div>
                </div>
              ))}
            </>
          )}
          {isTyping && (
            <div style={typingIndicatorStyle}>
              <span style={typingDotStyle} />
              <span style={typingDotStyle} />
              <span style={typingDotStyle} />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="mobile-compact-pad" style={formStyle}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            style={inputStyle}
          />
          <button type="submit" style={sendButtonStyle}>
            ✈️
          </button>
        </form>
      </div>
    </div>
  );
};

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (isToday) return time;
  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${time}`;
}

const containerStyle: React.CSSProperties = {
  minHeight: 'calc(100dvh - 60px)',
  backgroundColor: 'var(--background)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '1rem',
};

const loadingStyle: React.CSSProperties = {
  color: 'var(--muted)',
  fontSize: '1.1rem',
};

const chatBoxStyle: React.CSSProperties = {
  backgroundColor: 'var(--surface)',
  borderRadius: '24px',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
  width: '100%',
  maxWidth: '700px',
  height: '80vh',
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid var(--border)',
};

const backButtonStyle: React.CSSProperties = {
  background: 'rgba(124, 152, 255, 0.12)',
  border: '1px solid rgba(124, 152, 255, 0.25)',
  color: 'var(--primary)',
  fontSize: '1.4rem',
  fontWeight: 700,
  lineHeight: 1,
  cursor: 'pointer',
  padding: 0,
  width: '36px',
  height: '36px',
  minHeight: '36px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  transition: 'all 0.2s ease',
};

const headerStyle: React.CSSProperties = {
  borderBottom: '1px solid var(--border)',
  padding: '1.5rem',
  backgroundColor: 'linear-gradient(135deg, rgba(124, 152, 255, 0.1), rgba(164, 89, 255, 0.05))',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.75rem',
};

const headerTitleStyle: React.CSSProperties = {
  margin: '0 0 0.25rem 0',
  fontSize: '1.3rem',
  fontWeight: 700,
  color: 'var(--text)',
};

const onlineStatusStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.85rem',
  color: 'var(--muted)',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const onlineDotStyle = (isOnline: boolean): React.CSSProperties => ({
  display: 'inline-block',
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: isOnline ? '#44d190' : '#9bb2d6',
});

const messagesContainerStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  minHeight: 0,
  overscrollBehavior: 'contain',
};

const headerNameWrapStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
};

const headerAvatarStyle: React.CSSProperties = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: '2px solid var(--primary)',
  flexShrink: 0,
};

const headerAvatarPlaceholderStyle: React.CSSProperties = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  backgroundColor: 'var(--primary-soft)',
  color: 'var(--primary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.1rem',
  fontWeight: 700,
  border: '2px solid var(--primary)',
  flexShrink: 0,
};

const emptyStateStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  color: 'var(--muted)',
  textAlign: 'center',
};

const messageWrapperStyle = (isOwn: boolean): React.CSSProperties => ({
  display: 'flex',
  justifyContent: isOwn ? 'flex-end' : 'flex-start',
});

const messageStyle = (isOwn: boolean): React.CSSProperties => ({
  background: isOwn ? 'linear-gradient(135deg, #7c98ff, #6483ff)' : 'var(--surface-light)',
  color: isOwn ? 'white' : 'var(--text)',
  padding: '0.875rem 1.125rem',
  borderRadius: isOwn ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
  maxWidth: '70%',
  wordWrap: 'break-word',
  boxShadow: isOwn ? '0 2px 8px rgba(124, 152, 255, 0.2)' : 'none',
});

const messageContentStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.95rem',
  lineHeight: '1.4',
};

const messageTimeStyle: React.CSSProperties = {
  opacity: 0.7,
  fontSize: '0.75rem',
  display: 'block',
  marginTop: '0.25rem',
};

const typingIndicatorStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
  padding: '0.5rem',
  color: 'var(--muted)',
};

const typingDotStyle: React.CSSProperties = {
  display: 'inline-block',
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: 'var(--primary)',
  animation: 'typing 1.4s infinite',
};

const formStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0.75rem',
  padding: '1.25rem',
  borderTop: '1px solid var(--border)',
  backgroundColor: 'var(--surface-light)',
  borderBottomLeftRadius: '24px',
  borderBottomRightRadius: '24px',
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: '0.875rem 1.125rem',
  border: '1px solid var(--border)',
  borderRadius: '20px',
  fontSize: '0.95rem',
  backgroundColor: 'var(--surface)',
  color: 'var(--text)',
  transition: 'border-color 0.2s ease, background-color 0.2s ease',
};

const sendButtonStyle: React.CSSProperties = {
  padding: '0.875rem 1.5rem',
  backgroundColor: 'var(--primary)',
  color: 'white',
  border: 'none',
  borderRadius: '20px',
  cursor: 'pointer',
  fontSize: '1.1rem',
  transition: 'transform 0.2s ease, opacity 0.2s ease',
};

const errorBoxStyle: React.CSSProperties = {
  backgroundColor: 'rgba(247, 105, 105, 0.1)',
  border: '1px solid rgba(247, 105, 105, 0.3)',
  color: '#f8d7da',
  padding: '1rem',
  borderRadius: '12px',
};

const errorStyle: React.CSSProperties = {
  backgroundColor: 'rgba(247, 105, 105, 0.1)',
  color: '#f8d7da',
  padding: '1rem',
  margin: '1rem',
  borderRadius: '8px',
  border: '1px solid rgba(247, 105, 105, 0.3)',
};
