import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { messageService, profileService } from '../services/api.js';
import { useWebSocket } from '../hooks/useWebSocket.js';
import type { Message, Profile } from '../types/index.js';

interface NewMessagePayload {
  senderId: string;
  receiverId: string;
  messageId: string;
  content: string;
  createdAt: string;
}

interface TypingPayload {
  userId: string;
}

export const ChatPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUserProfile, setOtherUserProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { socket, isConnected, emit, on, off } = useWebSocket();
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

    on('new-message', (data: NewMessagePayload) => {
      if (data.senderId === userId) {
        setMessages((prev: Message[]) => [
          ...prev,
          {
            id: data.messageId,
            sender_id: data.senderId,
            receiver_id: data.receiverId,
            content: data.content,
            is_read: false,
            created_at: data.createdAt,
          },
        ]);
      }
    });

    on('user-typing', (data: TypingPayload) => {
      if (data.userId === userId) {
        setIsTyping(true);
      }
    });

    on('user-stopped-typing', (data: TypingPayload) => {
      if (data.userId === userId) {
        setIsTyping(false);
      }
    });

    return () => {
      off('new-message');
      off('user-typing');
      off('user-stopped-typing');
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
      const profile = await profileService.getUser(userId);
      setOtherUserProfile(profile);
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

      // Emit message through WebSocket
      emit('message', {
        receiverId: userId,
        content: newMessage,
        messageId: message.id,
        createdAt: message.created_at,
      });

      // Stop typing indicator
      emit('stop-typing', { receiverId: userId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  const handleTyping = () => {
    if (!userId) return;

    emit('typing', { receiverId: userId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      emit('stop-typing', { receiverId: userId });
    }, 2000);
  };

  if (loading) return <div style={containerStyle}>Loading chat...</div>;

  return (
    <div style={containerStyle}>
      <div style={chatBoxStyle}>
        <div style={headerStyle}>
          <div>
            <h2>{otherUserProfile?.first_name || 'Chat'}</h2>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>
              {otherUserProfile?.is_online ? 'Online now' : 'Offline'}
            </p>
          </div>
        </div>

        {error && <div style={errorStyle}>{error}</div>}

        <div style={messagesContainerStyle}>
          {messages.map((msg) => (
            <div key={msg.id} style={messageStyle(msg.sender_id === localUserId)}>
              <p>{msg.content}</p>
              <small>{new Date(msg.created_at).toLocaleTimeString()}</small>
            </div>
          ))}
          {isTyping && <div style={typingIndicatorStyle}>💬 {otherUserProfile?.first_name} is typing...</div>}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} style={formStyle}>
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
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  minHeight: 'calc(100vh - 60px)',
  backgroundColor: 'var(--background)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '1rem',
};

const chatBoxStyle: React.CSSProperties = {
  backgroundColor: 'var(--surface)',
  borderRadius: '16px',
  boxShadow: 'var(--shadow)',
  width: '100%',
  maxWidth: '600px',
  height: '80vh',
  display: 'flex',
  flexDirection: 'column',
};

const headerStyle: React.CSSProperties = {
  borderBottom: '1px solid var(--border)',
  padding: '1rem',
  backgroundColor: 'var(--surface-light)',
};

const messagesContainerStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const messageStyle = (isOwn: boolean): React.CSSProperties => ({
  alignSelf: isOwn ? 'flex-end' : 'flex-start',
  backgroundColor: isOwn ? 'var(--primary)' : 'var(--surface-light)',
  color: 'white',
  padding: '0.75rem 1rem',
  borderRadius: '16px',
  maxWidth: '70%',
  wordWrap: 'break-word',
});

const typingIndicatorStyle: React.CSSProperties = {
  color: 'var(--muted)',
  fontStyle: 'italic',
  padding: '0.5rem',
};

const formStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0.5rem',
  padding: '1rem',
  borderTop: '1px solid var(--border)',
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: '0.75rem',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  fontSize: '1rem',
  backgroundColor: 'var(--surface-light)',
  color: 'var(--text)',
};

const sendButtonStyle: React.CSSProperties = {
  padding: '0.75rem 1.5rem',
  backgroundColor: 'var(--primary)',
  color: 'white',
  border: 'none',
  borderRadius: '12px',
  cursor: 'pointer',
};

const errorStyle: React.CSSProperties = {
  backgroundColor: '#451616',
  color: '#f8d7da',
  padding: '1rem',
  margin: '1rem',
  borderRadius: '8px',
};
