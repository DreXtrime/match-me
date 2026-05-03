import { Router } from 'express';
import type { Request, Response } from 'express';
import { registerUser, loginUser, logoutUser, completeProfile, addUserBioData, setUserPreferences, getUserPreferences } from '../services/user.ts';
import { authMiddleware } from '../middleware/auth.ts';

const router = Router();

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const result = await registerUser(email, password);
    res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    res.status(400).json({ error: message });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const result = await loginUser(email, password);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    res.status(401).json({ error: message });
  }
});

// Logout
router.post('/logout', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await logoutUser(req.userId);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Logout failed';
    res.status(400).json({ error: message });
  }
});

// Complete profile
router.post('/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { username, first_name, last_name, bio, location, latitude, longitude } = req.body;

    const profile = await completeProfile(req.userId, {
      username,
      first_name,
      last_name,
      bio,
      location,
      latitude,
      longitude,
    });

    res.json(profile);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Profile update failed';
    res.status(400).json({ error: message });
  }
});

// Add bio data
router.post('/bio-data', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { bioDataItems } = req.body; // Array of { key, value, weight? }

    if (!Array.isArray(bioDataItems)) {
      res.status(400).json({ error: 'Bio data items must be an array' });
      return;
    }

    const results = await addUserBioData(req.userId, bioDataItems);
    res.json(results);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Bio data addition failed';
    res.status(400).json({ error: message });
  }
});

// Set preferences
router.post('/preferences', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { looking_for_key, looking_for_value, max_distance_km } = req.body;

    const preferences = await setUserPreferences(req.userId, { looking_for_key, looking_for_value, max_distance_km });
    res.json(preferences);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Preferences update failed';
    res.status(400).json({ error: message });
  }
});

// Get authenticated user's preferences
router.get('/preferences', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const preferences = await getUserPreferences(req.userId);
    res.json(preferences || {});
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get preferences';
    res.status(400).json({ error: message });
  }
});

export default router;
