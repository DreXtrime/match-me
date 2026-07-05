import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { RecommendationsPage } from './pages/RecommendationsPage.js';
import { ConnectionsPage } from './pages/ConnectionsPage.js';
import { ChatsPage } from './pages/ChatsPage.js';
import { ChatPage } from './pages/ChatPage.js';
import { UserProfilePage } from './pages/UserProfilePage.js';
import { CompleteProfilePage } from './pages/CompleteProfilePage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { messageService, connectionService } from './services/api.js';
import { WebSocketProvider } from './context/WebSocketContext.js';
import { useWebSocket } from './hooks/useWebSocket.js';

interface AppContentProps {
  isAuthenticated: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

function AppContent({ isAuthenticated, onLogin, onLogout }: AppContentProps) {
  const location = useLocation();
  const { socket, on, off } = useWebSocket();
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  const loadUnreadCount = async () => {
    try {
      const count = await messageService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      /* ignore */
    }
  };

  const loadPendingCount = async () => {
    try {
      const ids = await connectionService.getPendingRequests();
      setPendingCount(ids.length);
    } catch {
      /* ignore */
    }
  };

  // Load counts on auth change
  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      setPendingCount(0);
      return;
    }
    loadUnreadCount();
    loadPendingCount();
  }, [isAuthenticated]);

  // Re-fetch pending count when visiting connections page (catches accept/reject changes)
  useEffect(() => {
    if (location.pathname === '/connections' && isAuthenticated) {
      loadPendingCount();
    }
  }, [location.pathname, isAuthenticated]);

  // WebSocket listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewRequest = () => setPendingCount((c) => c + 1);
    const handleUnread = () => loadUnreadCount();

    on('connection-request', handleNewRequest);
    on('unread-update', handleUnread);
    on('new-message', handleUnread);

    return () => {
      off('connection-request', handleNewRequest);
      off('unread-update', handleUnread);
      off('new-message', handleUnread);
    };
  }, [socket, on, off]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    onLogout();
  };

  return (
    <>
      <Navbar isAuthenticated={isAuthenticated} unreadCount={unreadCount} pendingCount={pendingCount} onLogout={handleLogout} />
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={onLogin} />} />
        <Route path="/register" element={<RegisterPage onRegister={onLogin} />} />
        <Route path="/" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />} />
        <Route path="/complete-profile" element={isAuthenticated ? <CompleteProfilePage /> : <Navigate to="/login" />} />
        <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/recommendations" element={isAuthenticated ? <RecommendationsPage /> : <Navigate to="/login" />} />
        <Route path="/connections" element={isAuthenticated ? <ConnectionsPage /> : <Navigate to="/login" />} />
        <Route path="/chats" element={isAuthenticated ? <ChatsPage /> : <Navigate to="/login" />} />
        <Route path="/chat/:userId" element={isAuthenticated ? <ChatPage /> : <Navigate to="/login" />} />
        <Route path="/users/:userId" element={isAuthenticated ? <UserProfilePage /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  return (
    <WebSocketProvider isAuthenticated={isAuthenticated}>
      <Router>
        <AppContent isAuthenticated={isAuthenticated} onLogin={handleLogin} onLogout={handleLogout} />
      </Router>
    </WebSocketProvider>
  );
}

export default App;
