import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4003;

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add request timeout middleware
app.use((req, res, next) => {
  req.setTimeout(30000, () => {
    if (!res.headersSent) {
      res.status(408).json({ error: 'Request timeout' });
    }
  });
  next();
});

// Logger utility
const logger = {
  info: (service, message, data = {}) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      service,
      message,
      ...data
    }));
  },
  error: (service, message, error = {}) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'error',
      service,
      message,
      error: error.message || error
    }));
  },
  warn: (service, message, data = {}) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'warn',
      service,
      message,
      ...data
    }));
  }
};

// Mock data for when database is not available
const mockContacts = [
  {
    id: "contact-1",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+1 (555) 123-4567",
    company: "Tech Solutions Inc.",
    message: "Hi, I'm interested in your web development services for our company website redesign. We're looking for a modern, responsive design that works well on all devices.",
    status: "new",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "contact-2", 
    name: "Emily Davis",
    email: "emily.davis@startup.com",
    phone: "+1 (555) 987-6543",
    company: "Innovation Startup",
    message: "We need help with UI/UX design for our mobile app. Can we schedule a consultation? We're particularly interested in creating an intuitive user experience.",
    status: "contacted",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "contact-3",
    name: "Robert Wilson",
    email: "robert@business.com",
    phone: "+1 (555) 456-7890",
    company: "Local Business",
    message: "Looking for social media marketing services to grow our online presence. We want to increase engagement and reach more customers.",
    status: "completed",
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "contact-4",
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    phone: "+1 (555) 234-5678",
    company: "Marketing Agency",
    message: "We're interested in a complete digital transformation. Looking for web development, design, and marketing services.",
    status: "new",
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: "contact-5",
    name: "Michael Chen",
    email: "m.chen@techfirm.com",
    phone: "+1 (555) 345-6789",
    company: "Tech Firm",
    message: "Need assistance with e-commerce website development. Looking for secure payment integration and inventory management.",
    status: "contacted",
    createdAt: new Date(Date.now() - 21600000).toISOString(),
    updatedAt: new Date(Date.now() - 10800000).toISOString(),
  }
];

// Database connection status
let dbConnected = false;

// Simulate database connection attempt
const initializeDatabase = async () => {
  try {
    logger.info('admin-db', 'Attempting to connect to database...');
    // In a real app, this would be actual database connection
    // For now, we'll simulate a connection failure and use mock data
    await new Promise(resolve => setTimeout(resolve, 1000));
    throw new Error('Database connection failed - using mock data');
  } catch (error) {
    logger.warn('admin-db', 'Database unavailable, using mock data', { error: error.message });
    dbConnected = false;
    return false;
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  try {
    res.json({
      success: true,
      service: 'admin-service',
      status: 'healthy',
      database: dbConnected ? 'connected' : 'mock-mode',
      timestamp: new Date().toISOString(),
      port: PORT.toString()
    });
  } catch (error) {
    logger.error('admin-service', 'Health check failed', error);
    res.status(500).json({
      success: false,
      service: 'admin-service',
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Get all contacts
app.get('/contacts', async (req, res) => {
  try {
    logger.info('admin-service', 'Fetching contacts');
    
    // Return mock data since database is not connected
    res.json(mockContacts);
    
  } catch (error) {
    logger.error('admin-service', 'Error fetching contacts', error);
    res.status(500).json({
      error: 'Failed to fetch contacts',
      message: error.message
    });
  }
});

// Update contact status
app.patch('/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    logger.info('admin-service', 'Updating contact status', { id, status });
    
    // Find and update contact in mock data
    const contactIndex = mockContacts.findIndex(contact => contact.id === id);
    if (contactIndex === -1) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    mockContacts[contactIndex] = {
      ...mockContacts[contactIndex],
      status,
      updatedAt: new Date().toISOString()
    };
    
    res.json(mockContacts[contactIndex]);
    
  } catch (error) {
    logger.error('admin-service', 'Error updating contact status', error);
    res.status(500).json({
      error: 'Failed to update contact status',
      message: error.message
    });
  }
});

// Delete contact
app.delete('/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    logger.info('admin-service', 'Deleting contact', { id });
    
    const contactIndex = mockContacts.findIndex(contact => contact.id === id);
    if (contactIndex === -1) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    mockContacts.splice(contactIndex, 1);
    res.json({ success: true, message: 'Contact deleted successfully' });
    
  } catch (error) {
    logger.error('admin-service', 'Error deleting contact', error);
    res.status(500).json({
      error: 'Failed to delete contact',
      message: error.message
    });
  }
});

// Get analytics
app.get('/analytics', async (req, res) => {
  try {
    logger.info('admin-service', 'Fetching analytics');
    
    const totalContacts = mockContacts.length;
    const newContacts = mockContacts.filter(c => c.status === 'new').length;
    const contactedContacts = mockContacts.filter(c => c.status === 'contacted').length;
    const completedContacts = mockContacts.filter(c => c.status === 'completed').length;
    
    const analytics = {
      totalContacts,
      newContacts,
      contactedContacts,
      completedContacts,
      monthlyGrowth: 15.2,
      responseRate: contactedContacts > 0 ? (completedContacts / contactedContacts) * 100 : 0,
      monthlyStats: [
        { month: 'Jan', contacts: 12 },
        { month: 'Feb', contacts: 18 },
        { month: 'Mar', contacts: 25 },
        { month: 'Apr', contacts: 32 },
        { month: 'May', contacts: 28 },
        { month: 'Jun', contacts: totalContacts }
      ]
    };
    
    res.json(analytics);
    
  } catch (error) {
    logger.error('admin-service', 'Error fetching analytics', error);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      message: error.message
    });
  }
});

// Create contact (for contact form submissions)
app.post('/contacts', async (req, res) => {
  try {
    const { name, email, phone, company, message } = req.body;
    
    logger.info('admin-service', 'Creating new contact', { name, email });
    
    const newContact = {
      id: `contact-${Date.now()}`,
      name,
      email,
      phone: phone || null,
      company: company || null,
      message,
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockContacts.unshift(newContact);
    res.status(201).json(newContact);
    
  } catch (error) {
    logger.error('admin-service', 'Error creating contact', error);
    res.status(500).json({
      error: 'Failed to create contact',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('admin-service', 'Unhandled error', error);
  
  if (res.headersSent) {
    return next(error);
  }
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('admin-service', 'SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('admin-service', 'SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
const startServer = async () => {
  try {
    await initializeDatabase();
    
    app.listen(PORT, '0.0.0.0', () => {
      logger.info('admin-service', `Admin service running on port ${PORT}`, {
        port: PORT,
        database: dbConnected ? 'connected' : 'mock-mode',
        env: process.env.NODE_ENV || 'development'
      });
    });
  } catch (error) {
    logger.error('admin-service', 'Failed to start admin service', error);
    process.exit(1);
  }
};

startServer(); 