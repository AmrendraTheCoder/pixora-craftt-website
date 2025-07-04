import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.API_GATEWAY_PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'api-gateway',
    status: 'healthy',
    timestamp: new Date(),
    port: PORT
  });
});

// Service URLs
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:4001';
const CMS_SERVICE_URL = process.env.CMS_SERVICE_URL || 'http://cms-service:4002';
const ADMIN_SERVICE_URL = process.env.ADMIN_SERVICE_URL || 'http://admin-service:4003';

// Proxy configurations
const authProxy = createProxyMiddleware({
  target: AUTH_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/api/auth',
  },
  onError: (err, req, res) => {
    console.log('Auth service proxy error:', err.message);
    res.status(503).json({
      success: false,
      error: 'Auth service unavailable'
    });
  }
});

const cmsProxy = createProxyMiddleware({
  target: CMS_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api',
  },
  onError: (err, req, res) => {
    console.log('CMS service proxy error:', err.message);
    res.status(503).json({
      success: false,
      error: 'CMS service unavailable'
    });
  }
});

const adminProxy = createProxyMiddleware({
  target: ADMIN_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/admin': '',
  },
  onError: (err, req, res) => {
    console.log('Admin service proxy error:', err.message);
    res.status(503).json({
      success: false,
      error: 'Admin service unavailable'
    });
  }
});

// Routes
app.use('/api/auth', authProxy);
app.use('/api/admin', adminProxy);
app.use('/api', cmsProxy);

// Fallback for direct CMS access
app.get('/api/projects', async (req, res) => {
  try {
    const response = await fetch(`${CMS_SERVICE_URL}/api/projects`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.json({
      success: true,
      data: [
        {
          id: '1',
          title: 'Sample Project',
          category: 'web',
          description: 'A sample project for demonstration',
          image: '/images/sample.jpg',
          tags: ['React', 'Node.js'],
          isActive: true,
          isFeatured: true
        }
      ]
    });
  }
});

app.get('/api/services', async (req, res) => {
  try {
    const response = await fetch(`${CMS_SERVICE_URL}/api/services`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.json({
      success: true,
      data: [
        {
          id: '1',
          title: 'Web Development',
          description: 'Professional web development services',
          features: ['Responsive Design', 'Modern Tech Stack'],
          color: 'blue',
          isActive: true
        }
      ]
    });
  }
});

app.get('/api/testimonials', async (req, res) => {
  try {
    const response = await fetch(`${CMS_SERVICE_URL}/api/testimonials`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.json({
      success: true,
      data: [
        {
          id: '1',
          name: 'Sample Client',
          role: 'CEO',
          company: 'Sample Company',
          content: 'Great service and professional team!',
          rating: 5,
          isActive: true,
          isFeatured: true
        }
      ]
    });
  }
});

// Contact form endpoint
app.post('/api/contact', (req, res) => {
  console.log('Contact form submission:', req.body);
  res.json({
    success: true,
    message: 'Thank you for your message. We will get back to you soon!'
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Proxying auth requests to: ${AUTH_SERVICE_URL}`);
  console.log(`Proxying CMS requests to: ${CMS_SERVICE_URL}`);
  console.log(`Proxying admin requests to: ${ADMIN_SERVICE_URL}`);
}); 