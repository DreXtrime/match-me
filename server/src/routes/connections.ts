import { Router } from 'express';
import type { Request, Response } from 'express';
import {
  createConnectionRequest,
  getConnectionRequest,
  getConnectionById,
  acceptConnection,
  rejectConnection,
  deleteConnection,
  getConnectedUsers,
  getPendingConnectionRequests,
  addDismissedRecommendation,
} from '../models/connection.ts';
import { authMiddleware } from '../middleware/auth.ts';

const router = Router();

// Get connected users
router.get('/connections', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const connections = await getConnectedUsers(req.userId);
    res.json(connections);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get connections';
    res.status(400).json({ error: message });
  }
});

// Request connection
router.post('/connections/:userId', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { userId } = req.params;

    if (req.userId === userId) {
      res.status(400).json({ error: 'Cannot connect with yourself' });
      return;
    }

    // Check if connection already exists
    const existingConnection = await getConnectionRequest(req.userId, userId);
    if (existingConnection) {
      res.status(400).json({ error: 'Connection already exists' });
      return;
    }

    const connection = await createConnectionRequest(req.userId, userId);
    res.status(201).json(connection);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create connection request';
    res.status(400).json({ error: message });
  }
});

// Get pending connection requests
router.get('/connections/requests/pending', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const requests = await getPendingConnectionRequests(req.userId);
    res.json(requests);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get connection requests';
    res.status(400).json({ error: message });
  }
});

// Accept connection request
router.post('/connections/:connectionId/accept', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { connectionId } = req.params;
    const existingConnection = await getConnectionById(connectionId);

    if (!existingConnection) {
      res.status(404).json({ error: 'Connection not found' });
      return;
    }

    if (existingConnection.receiver_id !== req.userId) {
      res.status(403).json({ error: 'Permission denied to accept this connection' });
      return;
    }

    const connection = await acceptConnection(connectionId);
    res.json(connection);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to accept connection';
    res.status(400).json({ error: message });
  }
});

// Reject connection request
router.post('/connections/:connectionId/reject', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { connectionId } = req.params;
    const existingConnection = await getConnectionById(connectionId);

    if (!existingConnection) {
      res.status(404).json({ error: 'Connection not found' });
      return;
    }

    if (existingConnection.receiver_id !== req.userId) {
      res.status(403).json({ error: 'Permission denied to reject this connection' });
      return;
    }

    const connection = await rejectConnection(connectionId);
    res.json(connection);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reject connection';
    res.status(400).json({ error: message });
  }
});

// Delete/remove connection
router.delete('/connections/:connectionId', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { connectionId } = req.params;
    const existingConnection = await getConnectionById(connectionId);

    if (!existingConnection) {
      res.status(404).json({ error: 'Connection not found' });
      return;
    }

    if (existingConnection.requester_id !== req.userId && existingConnection.receiver_id !== req.userId) {
      res.status(403).json({ error: 'Permission denied to remove this connection' });
      return;
    }

    await deleteConnection(connectionId);
    res.json({ message: 'Connection deleted' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete connection';
    res.status(400).json({ error: message });
  }
});

// Dismiss recommendation
router.post('/recommendations/:userId/dismiss', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { userId } = req.params;

    if (req.userId === userId) {
      res.status(400).json({ error: 'Cannot dismiss yourself' });
      return;
    }

    const dismissed = await addDismissedRecommendation(req.userId, userId);
    res.json(dismissed);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to dismiss recommendation';
    res.status(400).json({ error: message });
  }
});

export default router;
