import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { messageService, profileService } from '../services/api.js';
import { useWebSocket } from '../hooks/useWebSocket.js';
import type { Message, User } from '../types';
import { Btn } from '../components/Btn.tsx';
import { LoadingScreen } from '../components/Loadingscreen.tsx';

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

  useEffect(() => {
    if (import.meta.env.VITE_DEMO_MODE !== 'true' || !userId) return;

    const handleMockMessage = (e: Event) => {
      const { senderId } = (e as CustomEvent).detail;
      if (senderId === userId) loadMessages(false);
    };

    const handleMockTyping = (e: Event) => {
      const { senderId } = (e as CustomEvent).detail;
      if (senderId === userId) setIsTyping(true);
    };

    const handleMockStopTyping = (e: Event) => {
      const { senderId } = (e as CustomEvent).detail;
      if (senderId === userId) setIsTyping(false);
    };

    window.addEventListener('mock:new-message', handleMockMessage);
    window.addEventListener('mock:typing', handleMockTyping);
    window.addEventListener('mock:stop-typing', handleMockStopTyping);

    return () => {
      window.removeEventListener('mock:new-message', handleMockMessage);
      window.removeEventListener('mock:typing', handleMockTyping);
      window.removeEventListener('mock:stop-typing', handleMockStopTyping);
    };
  }, [userId]);

  const loadMessages = async (showLoading = true) => {
    try {
      if (!userId) return;
      if (showLoading) setLoading(true);
      const msgs = await messageService.getConversation(userId);
      setMessages(msgs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      if (showLoading) setLoading(false);
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
      emit('user-stopped-typing', { receiverId: userId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  const handleTyping = () => {
    if (!userId) return;
    emit('user-typing', { receiverId: userId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emit('user-stopped-typing', { receiverId: userId });
    }, 2000);
  };

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return <LoadingScreen />;
  }

  if (!userId) {
    return (
      <div className="min-h-[calc(100dvh-60px)] flex items-center justify-center px-4">
        <div className="border-2 border-red bg-red/10 text-red px-5 py-3 text-sm" style={{ fontFamily: 'var(--font-ui)' }}>
          ✕ Chat not found
        </div>
      </div>
    );
  }

  // ── Main ─────────────────────────────────────────────────────────────────

  // @ts-ignore
  return (
    <div className="mobile-no-pad min-h-[calc(100dvh-60px)] flex justify-center items-center p-4">
      <div className="mobile-edge-card w-full max-w-[700px] h-[80vh] flex flex-col border-2 border-border bg-panel">
        {/* Header */}
        <div className="mobile-compact-pad flex items-center justify-between gap-3 px-5 py-3 bg-surface border-b-2 border-border">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar */}
            {otherUser?.profilePicture ? (
              <img src={otherUser.profilePicture} alt={otherUser.name} className="w-24 h-24 object-cover border border-border shrink-0" />
            ) : (
              <div
                className="w-24 h-24 border border-border flex items-center justify-center text-yellow font-black text-base shrink-0"
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                {otherUser?.name?.charAt(0) ?? '?'}
              </div>
            )}
            {/* Name + status */}
            <div className="min-w-0">
              <p className="text-text font-bold text-base truncate m-0" style={{ fontFamily: 'var(--font-ui)' }}>
                {otherUser?.name || 'Chat'}
              </p>
              <p
                className={`text-xs m-0 flex items-center gap-1.5 ${otherUser?.isOnline ? 'text-green' : 'text-muted'}`}
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                <span className={`inline-block w-2 h-2 ${otherUser?.isOnline ? 'bg-green' : 'bg-muted'}`} />
                {otherUser?.isOnline ? 'Online now' : 'Offline'}
              </p>
            </div>
          </div>

          {/* Back button */}
          <Btn variant="chat" onClick={() => navigate('/chats')} aria-label="Back to chats">
            ← Back
          </Btn>
        </div>

        {/* Inline error */}
        {error && (
          <div className="mx-4 mt-3 border border-red/30 bg-red/10 text-red px-4 py-2 text-sm" style={{ fontFamily: 'var(--font-ui)' }}>
            ✕ {error}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-3 p-4 overscroll-contain">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted text-sm text-center" style={{ fontFamily: 'var(--font-ui)' }}>
              No messages yet. Start the conversation! 💬
            </div>
          ) : (
            <>
              <div className="flex-1 min-h-0" />
              {messages.map((msg) => {
                const isOwn = msg.sender_id === localUserId;
                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-4 py-3 break-words ${isOwn ? 'bg-yellow text-bg' : 'bg-surface border border-border text-text'}`}>
                      <p className="m-0 text-sm leading-snug" style={{ fontFamily: 'var(--font-ui)' }}>
                        {msg.content}
                      </p>
                      <small className="block mt-1 text-xs opacity-60" style={{ fontFamily: 'var(--font-ui)' }}>
                        {formatMessageTime(msg.created_at)}
                      </small>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-center gap-1 px-2 py-1">
              {[0, 1, 2].map((i) => (
                <span key={i} className="inline-block w-2 h-2 bg-yellow" style={{ animation: `typing 1.4s infinite ${i * 0.2}s` }} />
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input form */}
        <form onSubmit={handleSendMessage} className="mobile-compact-pad flex gap-3 px-4 py-3 border-t-2 border-border bg-surface">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 bg-bg border border-border text-text text-sm placeholder:text-muted focus:outline-none focus:border-yellow transition-colors"
            style={{ fontFamily: 'var(--font-ui)' }}
          />
          <Btn variant="chat" onClick={() => {}}>
            Send️
          </Btn>
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
