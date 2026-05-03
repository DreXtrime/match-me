import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import 'express-async-errors';
import { createServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.ts';
import usersRoutes from './routes/users.ts';
import connectionsRoutes from './routes/connections.ts';
import messagesRoutes from './routes/messages.ts';
import { authMiddleware } from './middleware/auth.ts';
import { updateUserOnlineStatus } from './models/user.ts';
import { verifyToken } from './utils/auth.ts';

dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', authRoutes);
app.use('/', usersRoutes);
app.use('/', connectionsRoutes);
app.use('/', messagesRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// WebSocket events
io.on('connection', async (socket: Socket) => {
  console.log(`User connected: ${socket.id}`);

  // Authenticate socket connection
  const token = socket.handshake.auth.token;
  if (!token) {
    socket.disconnect();
    return;
  }

  try {
    const { userId } = verifyToken(token);
    socket.data.userId = userId;

    // User is now online
    await updateUserOnlineStatus(userId, true);

    // Join user's room for direct messages
    socket.join(`user:${userId}`);

    socket.on('typing', (data: { receiverId: string }) => {
      // Broadcast typing indicator
      io.to(`user:${data.receiverId}`).emit('user-typing', { userId });
    });

    socket.on('stop-typing', (data: { receiverId: string }) => {
      io.to(`user:${data.receiverId}`).emit('user-stopped-typing', { userId });
    });

    socket.on('message', (data: { receiverId: string; content: string; messageId: string; createdAt: string }) => {
      // Broadcast message to recipient
      io.to(`user:${data.receiverId}`).emit('new-message', {
        senderId: userId,
        receiverId: data.receiverId,
        content: data.content,
        messageId: data.messageId,
        createdAt: data.createdAt,
      });

      // Notify about unread messages
      io.to(`user:${data.receiverId}`).emit('unread-update', { senderId: userId });
    });

    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.id}`);
      try {
        await updateUserOnlineStatus(userId, false);
      } catch (error) {
        console.error('Error updating user offline status:', error);
      }
    });
  } catch (error) {
    console.error('Socket authentication error:', error);
    socket.disconnect();
  }
});

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Global error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Match-me server running on port ${PORT}`);
});

export { app, io };
