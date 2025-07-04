import { Router } from 'express';
import { authenticate, requireRole } from '@pixora-craftt/shared/middleware/auth.js';
import { UserRole } from '@pixora-craftt/shared/types/common.js';
import { Service } from '../entities/Service.js';
import { Project } from '../entities/Project.js';
import { Testimonial } from '../entities/Testimonial.js';

const router = Router();

// Public routes - no authentication required
router.get('/services', async (req, res) => {
  try {
    const serviceRepo = req.database.getRepository(Service);
    const services = await serviceRepo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' }
    });

    res.json({
      success: true,
      data: services.map(service => service.toPublicObject())
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch services'
    });
  }
});

router.get('/projects', async (req, res) => {
  try {
    const projectRepo = req.database.getRepository(Project);
    const { category, featured } = req.query;
    
    const whereConditions: any = { isActive: true };
    if (category) whereConditions.category = category;
    if (featured === 'true') whereConditions.isFeatured = true;

    const projects = await projectRepo.find({
      where: whereConditions,
      order: { sortOrder: 'ASC' }
    });

    res.json({
      success: true,
      data: projects.map(project => project.toPublicObject())
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch projects'
    });
  }
});

router.get('/testimonials', async (req, res) => {
  try {
    const testimonialRepo = req.database.getRepository(Testimonial);
    const { featured } = req.query;
    
    const whereConditions: any = { isActive: true };
    if (featured === 'true') whereConditions.isFeatured = true;

    const testimonials = await testimonialRepo.find({
      where: whereConditions,
      order: { sortOrder: 'ASC' }
    });

    res.json({
      success: true,
      data: testimonials.map(testimonial => testimonial.toPublicObject())
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch testimonials'
    });
  }
});

// Protected routes - admin only
router.use(authenticate);
router.use(requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]));

// Services management
router.post('/services', async (req, res) => {
  try {
    const serviceRepo = req.database.getRepository(Service);
    const service = serviceRepo.create(req.body);
    await serviceRepo.save(service);

    res.status(201).json({
      success: true,
      data: service.toPublicObject(),
      message: 'Service created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create service'
    });
  }
});

router.put('/services/:id', async (req, res) => {
  try {
    const serviceRepo = req.database.getRepository(Service);
    const service = await serviceRepo.findOne({ where: { id: req.params.id } });
    
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    Object.assign(service, req.body);
    await serviceRepo.save(service);

    res.json({
      success: true,
      data: service.toPublicObject(),
      message: 'Service updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update service'
    });
  }
});

router.delete('/services/:id', async (req, res) => {
  try {
    const serviceRepo = req.database.getRepository(Service);
    const result = await serviceRepo.delete(req.params.id);

    if (result.affected === 0) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete service'
    });
  }
});

// Similar CRUD operations for projects and testimonials...
router.post('/projects', async (req, res) => {
  try {
    const projectRepo = req.database.getRepository(Project);
    const project = projectRepo.create(req.body);
    await projectRepo.save(project);

    res.status(201).json({
      success: true,
      data: project.toPublicObject(),
      message: 'Project created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create project'
    });
  }
});

router.post('/testimonials', async (req, res) => {
  try {
    const testimonialRepo = req.database.getRepository(Testimonial);
    const testimonial = testimonialRepo.create(req.body);
    await testimonialRepo.save(testimonial);

    res.status(201).json({
      success: true,
      data: testimonial.toPublicObject(),
      message: 'Testimonial created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create testimonial'
    });
  }
});

export { router as contentRoutes }; 