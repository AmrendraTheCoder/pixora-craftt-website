import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.CMS_SERVICE_PORT || 4002;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'cms-service',
    status: 'healthy',
    timestamp: new Date(),
    port: PORT
  });
});

// Mock data
const mockProjects = [
  {
    id: '1',
    title: 'E-commerce Platform',
    category: 'web',
    description: 'Modern e-commerce solution with React and Node.js',
    image: '/images/project1.jpg',
    tags: ['React', 'Node.js', 'PostgreSQL'],
    isActive: true,
    isFeatured: true
  },
  {
    id: '2',
    title: 'Mobile Banking App',
    category: 'mobile',
    description: 'Secure mobile banking application with biometric authentication',
    image: '/images/project2.jpg',
    tags: ['React Native', 'Security', 'FinTech'],
    isActive: true,
    isFeatured: true
  }
];

const mockServices = [
  {
    id: '1',
    title: 'Web Development',
    description: 'Custom web applications built with modern technologies',
    features: ['Responsive Design', 'Performance Optimization', 'SEO'],
    color: 'blue',
    isActive: true
  },
  {
    id: '2',
    title: 'Mobile Development',
    description: 'Native and cross-platform mobile applications',
    features: ['iOS Development', 'Android Development', 'React Native'],
    color: 'green',
    isActive: true
  }
];

const mockTestimonials = [
  {
    id: '1',
    name: 'John Smith',
    role: 'CTO',
    company: 'TechCorp',
    content: 'Pixora Craftt delivered an exceptional web application that exceeded our expectations.',
    rating: 5,
    isActive: true,
    isFeatured: true
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    role: 'Founder',
    company: 'StartupXYZ',
    content: 'Outstanding mobile app development with great attention to detail.',
    rating: 5,
    isActive: true,
    isFeatured: true
  }
];

// API endpoints
app.get('/api/projects', (req, res) => {
  res.json({
    success: true,
    data: mockProjects
  });
});

app.get('/api/services', (req, res) => {
  res.json({
    success: true,
    data: mockServices
  });
});

app.get('/api/testimonials', (req, res) => {
  res.json({
    success: true,
    data: mockTestimonials
  });
});

// CMS Management endpoints
app.get('/api/cms/projects', (req, res) => {
  res.json({
    success: true,
    data: mockProjects,
    pagination: {
      page: 1,
      limit: 10,
      total: mockProjects.length,
      totalPages: 1
    }
  });
});

app.post('/api/cms/projects', (req, res) => {
  const newProject = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  mockProjects.push(newProject);
  res.status(201).json({
    success: true,
    data: newProject
  });
});

app.get('/api/cms/services', (req, res) => {
  res.json({
    success: true,
    data: mockServices,
    pagination: {
      page: 1,
      limit: 10,
      total: mockServices.length,
      totalPages: 1
    }
  });
});

app.get('/api/cms/testimonials', (req, res) => {
  res.json({
    success: true,
    data: mockTestimonials,
    pagination: {
      page: 1,
      limit: 10,
      total: mockTestimonials.length,
      totalPages: 1
    }
  });
});

app.listen(PORT, () => {
  console.log(`CMS service running on port ${PORT}`);
}); 