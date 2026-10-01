import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { messageService, profileService } from '../services/api.js';
import { useWebSocket } from '../hooks/useWebSocket.js';
import type { Chat, User } from '../types';
import { Btn } from '../components/Btn.tsx';
import { LoadingScreen } from '../components/Loadingscreen.tsx';

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
      setChats((prev) => prev.map((chat) => (chat.user?.id === userId ? { ...chat, user: { ...chat.user!, isOnline: true } } : chat)));
    };
    const handleUserOffline = (userId: string) => {
      setChats((prev) => prev.map((chat) => (chat.user?.id === userId ? { ...chat, user: { ...chat.user!, isOnline: false } } : chat)));
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
    return <LoadingScreen />;
  }

  return (
    <div className="mobile-compact-pad w-full min-h-[calc(100vh-60px)] py-10 px-4">
      <div className="max-w-[700px] mx-auto flex flex-col gap-6">
        {/* Page title */}
        <div className="border-2 border-border bg-panel px-6 py-5">
          <h1 className="text-2xl font-bold text-text mb-1" style={{ fontFamily: 'var(--font-ui)' }}>
            Messages
          </h1>
          <p className="text-muted text-sm" style={{ fontFamily: 'var(--font-ui)' }}>
            Connect with your matches
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="border-2 border-red bg-red/10 px-5 py-3 text-red text-sm" style={{ fontFamily: 'var(--font-ui)' }}>
            ✕ {error}
          </div>
        )}

        {/* Empty state */}
        {chats.length === 0 ? (
          <div className="border-2 border-border bg-panel px-6 py-16 flex flex-col items-center gap-4 text-center">
            <span className="text-5xl">💬</span>
            <p className="text-text font-bold text-base" style={{ fontFamily: 'var(--font-ui)' }}>
              No chats yet
            </p>
            <p className="text-muted text-sm max-w-xs" style={{ fontFamily: 'var(--font-ui)' }}>
              Connect with someone and start chatting!
            </p>
            <button
              onClick={() => navigate('/recommendations')}
              className="px-6 py-3 bg-yellow text-bg font-bold text-sm border-2 border-yellow hover:opacity-90 transition-opacity"
              style={{ fontFamily: 'var(--font-ui)' }}
            >
              ▶ Find Matches
            </button>
          </div>
        ) : (
          /* Chats list */
          <div className="border-2 border-border">
            {/* Panel header */}
            <div className="flex items-center justify-between bg-surface border-b-2 border-border px-5 py-2">
              <span className="text-yellow font-bold text-sm uppercase tracking-wider" style={{ fontFamily: 'var(--font-ui)' }}>
                Chats
              </span>
              <span
                className="bg-bg border border-border text-muted text-xs font-bold px-2 py-0.5 tabular-nums"
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                {chats.length}
              </span>
            </div>

            {/* Chat rows */}
            <div className="bg-panel divide-y divide-border">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => navigate(`/chat/${chat.id}`)}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-surface transition-colors cursor-pointer"
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {chat.user?.profilePicture ? (
                      <img src={chat.user.profilePicture} alt={chat.user.name} className="w-24 h-24 object-cover border border-border" />
                    ) : (
                      <div
                        className="w-24 h-24 bg-surface border border-border flex items-center justify-center text-yellow font-black text-lg"
                        style={{ fontFamily: 'var(--font-ui)' }}
                      >
                        {chat.user?.name?.charAt(0) ?? '?'}
                      </div>
                    )}
                    {chat.user?.isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green border-2 border-panel" />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 mb-0.5">
                      <p className="text-text font-bold text-base truncate" style={{ fontFamily: 'var(--font-ui)' }}>
                        {chat.user?.name || `User ${chat.id.substring(0, 8)}`}
                      </p>
                      <span className="text-text text-xs whitespace-nowrap" style={{ fontFamily: 'var(--font-ui)' }}>
                        Last Message: {formatTime(new Date(chat.lastMessageTime))}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${chat.user?.isOnline ? 'text-green' : 'text-muted'}`} style={{ fontFamily: 'var(--font-ui)' }}>
                      {chat.user?.isOnline ? '● Online' : '○ Offline'}
                    </p>
                  </div>

                  {/* Arrow */}
                  <Btn variant="primary" onClick={() => {}}>
                    Chat →
                  </Btn>
                </div>
              ))}
            </div>
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

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} Minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} Hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 30) return `${diffDays} Day${diffDays === 1 ? '' : 's'} ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} Month${diffMonths === 1 ? '' : 's'} ago`;

  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears} Year${diffYears === 1 ? '' : 's'} ago`;
}
