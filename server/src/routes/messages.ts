import { Router } from 'express';
import type { Request, Response } from 'express';
import { sendMessage, getConversationMessages, markMessagesAsRead, getRecentChats, getUnreadMessageCount } from '../models/connection.ts';
import { areUsersConnected } from '../models/connection.ts';
import { authMiddleware } from '../middleware/auth.ts';

const router = Router();

// Send message
router.post('/messages', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      res.status(400).json({ error: 'Receiver ID and content are required' });
      return;
    }

    const connected = await areUsersConnected(req.userId, receiverId);
    if (!connected) {
      res.status(403).json({ error: 'You are not connected with this user' });
      return;
    }

    const message = await sendMessage(req.userId, receiverId, content);
    res.status(201).json(message);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send message';
    res.status(400).json({ error: message });
  }
});

// Get conversation messages
router.get('/messages/:userId', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { userId } = req.params;
    const { limit = '50', offset = '0' } = req.query;

    const connected = await areUsersConnected(req.userId, userId);
    if (!connected) {
      res.status(403).json({ error: 'You are not connected with this user' });
      return;
    }

    const messages = await getConversationMessages(req.userId, userId, parseInt(limit as string), parseInt(offset as string));

    // Mark messages as read
    await markMessagesAsRead(userId, req.userId);

    res.json(messages);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get messages';
    res.status(400).json({ error: message });
  }
});

// Get recent chats
router.get('/chats', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { limit = '50' } = req.query;

    const chats = await getRecentChats(req.userId, parseInt(limit as string));
    res.json(chats);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get chats';
    res.status(400).json({ error: message });
  }
});

// Get unread message count
router.get('/unread-count', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const count = await getUnreadMessageCount(req.userId);
    res.json({ unreadCount: count });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get unread count';
    res.status(400).json({ error: message });
  }
});

export default router;
