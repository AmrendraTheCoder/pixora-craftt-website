import { Router } from 'express';
import { authenticate, requireRole } from '@pixora-craftt/shared/middleware/auth.js';
import { UserRole } from '@pixora-craftt/shared/types/common.js';
import { Media } from '../entities/Media.js';

const router = Router();

// Public routes - serve media files
router.get('/:id', async (req, res) => {
  try {
    const mediaRepo = req.database.getRepository(Media);
    const media = await mediaRepo.findOne({
      where: { id: req.params.id, isActive: true }
    });

    if (!media) {
      return res.status(404).json({
        success: false,
        error: 'Media not found'
      });
    }

    res.json({
      success: true,
      data: media.toPublicObject()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch media'
    });
  }
});

// Protected routes
router.use(authenticate);
router.use(requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]));

router.get('/', async (req, res) => {
  try {
    const mediaRepo = req.database.getRepository(Media);
    const media = await mediaRepo.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' }
    });

    res.json({
      success: true,
      data: media.map(m => m.toPublicObject())
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch media'
    });
  }
});

router.post('/upload', async (req, res) => {
  try {
    // Simple file upload simulation - in reality would use multer middleware
    const mediaRepo = req.database.getRepository(Media);
    const mediaData = req.body; // Would be file data from multer
    
    const media = mediaRepo.create(mediaData);
    await mediaRepo.save(media);

    res.status(201).json({
      success: true,
      data: media.toPublicObject(),
      message: 'File uploaded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to upload file'
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const mediaRepo = req.database.getRepository(Media);
    const result = await mediaRepo.delete(req.params.id);

    if (result.affected === 0) {
      return res.status(404).json({
        success: false,
        error: 'Media not found'
      });
    }

    res.json({
      success: true,
      message: 'Media deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete media'
    });
  }
});

export { router as mediaRoutes }; 