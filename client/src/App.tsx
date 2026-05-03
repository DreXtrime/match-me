import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { RecommendationsPage } from './pages/RecommendationsPage.js';
import { ConnectionsPage } from './pages/ConnectionsPage.js';
import { ChatsPage } from './pages/ChatsPage.js';
import { ChatPage } from './pages/ChatPage.js';
import { CompleteProfilePage } from './pages/CompleteProfilePage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { messageService } from './services/api.js';
import { useWebSocket } from './hooks/useWebSocket.js';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket, on, off } = useWebSocket();

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    loadUnreadCount();

    const interval = setInterval(loadUnreadCount, 10000);

    return () => {
      clearInterval(interval);
      off('unread-update');
      off('new-message');
    };
  }, [isAuthenticated, off]);

  useEffect(() => {
    if (!socket) return;

    const handleUnreadUpdate = () => {
      loadUnreadCount();
    };

    on('unread-update', handleUnreadUpdate);
    on('new-message', handleUnreadUpdate);

    return () => {
      off('unread-update', handleUnreadUpdate);
      off('new-message', handleUnreadUpdate);
    };
  }, [socket, on, off]);

  const loadUnreadCount = async () => {
    try {
      const count = await messageService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to load unread count:', err);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUnreadCount(0);
  };

  return (
    <Router>
      <Navbar isAuthenticated={isAuthenticated} unreadCount={unreadCount} onLogout={() => { setIsAuthenticated(false); setUnreadCount(0); }} />
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={() => setIsAuthenticated(true)} />} />
        <Route path="/register" element={<RegisterPage onRegister={() => setIsAuthenticated(true)} />} />
        <Route
          path="/"
          element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/complete-profile"
          element={isAuthenticated ? <CompleteProfilePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/recommendations"
          element={isAuthenticated ? <RecommendationsPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/connections"
          element={isAuthenticated ? <ConnectionsPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/chats"
          element={isAuthenticated ? <ChatsPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/chat/:userId"
          element={isAuthenticated ? <ChatPage /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
