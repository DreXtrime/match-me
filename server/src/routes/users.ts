import { Router } from 'express';
import type { Request, Response } from 'express';
import { getRecommendations } from '../services/matching.ts';
import { getUserPublicInfo, getUserProfile, getUserBioInfo } from '../services/user.ts';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.ts';
import { getUserById, getProfileByUserId } from '../models/user.ts';
import { getConnectionRequest } from '../models/connection.ts';

const router = Router();

const canViewUserData = async (viewerId: string | undefined, targetId: string): Promise<boolean> => {
  if (!viewerId) {
    return false;
  }

  if (viewerId === targetId) {
    return true;
  }

  const connection = await getConnectionRequest(viewerId, targetId);
  if (connection && (connection.status === 'accepted' || connection.status === 'pending')) {
    return true;
  }

  const recommendations = await getRecommendations(viewerId, 10);
  return recommendations.some((recommendation) => recommendation.id === targetId);
};

// Get recommendations for authenticated user
router.get('/recommendations', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const recommendations = await getRecommendations(req.userId, 10);
    res.json(recommendations);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get recommendations';
    res.status(400).json({ error: message });
  }
});

// Get user public information (id, name, picture)
router.get('/users/:id', optionalAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await getUserById(id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const profile = await getProfileByUserId(id);
    if (!profile) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (!await canViewUserData(req.userId, id)) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const userInfo = await getUserPublicInfo(id);
    res.json(userInfo);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get user';
    res.status(400).json({ error: message });
  }
});

// Get user profile (includes bio)
router.get('/users/:id/profile', optionalAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await getUserById(id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const profile = await getProfileByUserId(id);
    if (!profile) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (!await canViewUserData(req.userId, id)) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const userProfile = await getUserProfile(id);
    res.json(userProfile);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get user profile';
    res.status(400).json({ error: message });
  }
});

// Get user bio data
router.get('/users/:id/bio', optionalAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await getUserById(id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (!await canViewUserData(req.userId, id)) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const userBioInfo = await getUserBioInfo(id);
    res.json(userBioInfo);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get user bio';
    res.status(400).json({ error: message });
  }
});

// Get authenticated user's info (shortcut)
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userInfo = await getUserPublicInfo(req.userId);
    res.json(userInfo);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get user';
    res.status(400).json({ error: message });
  }
});

// Get authenticated user's profile
router.get('/me/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userProfile = await getUserProfile(req.userId);
    res.json(userProfile);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get user profile';
    res.status(400).json({ error: message });
  }
});

// Get authenticated user's bio data
router.get('/me/bio', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userBioInfo = await getUserBioInfo(req.userId);
    res.json(userBioInfo);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get user bio';
    res.status(400).json({ error: message });
  }
});

export default router;
