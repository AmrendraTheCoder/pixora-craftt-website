import { Router } from 'express';
import { authenticate } from '@pixora-craftt/shared/middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { updateProfileSchema } from '../validation/auth.js';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const user = req.user;
    res.json({
      success: true,
      data: user?.toSafeObject()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get user profile'
    });
  }
});

// Update user profile
router.put('/profile', validate(updateProfileSchema), async (req, res) => {
  try {
    const user = req.user;
    const updates = req.body;
    
    Object.assign(user, updates);
    await req.database.getRepository('User').save(user);
    
    res.json({
      success: true,
      data: user?.toSafeObject(),
      message: 'Profile updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

export { router as userRoutes }; 