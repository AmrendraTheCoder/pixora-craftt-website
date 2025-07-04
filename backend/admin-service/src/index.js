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
    
    // Calculate dynamic view metrics based on contact activity and time
    const currentTime = Date.now();
    const dailyViews = Math.floor(Math.random() * 200) + 150; // 150-350 daily views
    const weeklyViews = dailyViews * 7 + Math.floor(Math.random() * 500);
    const monthlyViews = weeklyViews * 4 + Math.floor(Math.random() * 2000);
    const totalViews = monthlyViews * 6 + Math.floor(Math.random() * 5000) + 10000; // Base of 10k+ views
    
    // Calculate SEO score based on content activity
    const contentActivity = totalContacts * 2; // More contacts = more content engagement
    const baseSeoScore = 85;
    const seoScore = Math.min(100, baseSeoScore + Math.floor(contentActivity / 10));
    
    // Calculate engagement metrics
    const engagementRate = totalContacts > 0 ? Math.min(95, 65 + (completedContacts / totalContacts) * 30) : 0;
    const conversionRate = totalContacts > 0 ? (completedContacts / totalContacts) * 100 : 0;
    
    const analytics = {
      // Contact metrics
      totalContacts,
      newContacts,
      contactedContacts,
      completedContacts,
      
      // Growth and performance
      monthlyGrowth: 15.2,
      responseRate: contactedContacts > 0 ? (completedContacts / contactedContacts) * 100 : 0,
      conversionRate: Math.round(conversionRate * 10) / 10,
      
      // Website analytics
      totalViews,
      dailyViews,
      weeklyViews,
      monthlyViews,
      uniqueVisitors: Math.floor(totalViews * 0.7), // 70% unique visitor rate
      avgSessionDuration: '2m 34s',
      bounceRate: 42.3,
      
      // SEO and performance
      seoScore,
      pagespeedScore: 94,
      mobileScore: 98,
      
      // Engagement metrics
      engagementRate: Math.round(engagementRate * 10) / 10,
      socialShares: Math.floor(Math.random() * 150) + 50,
      newsletterSignups: Math.floor(Math.random() * 30) + 10,
      
      // Time-based data
      monthlyStats: [
        { month: 'Jan', contacts: 12, views: 8420 },
        { month: 'Feb', contacts: 18, views: 9680 },
        { month: 'Mar', contacts: 25, views: 11240 },
        { month: 'Apr', contacts: 32, views: 13580 },
        { month: 'May', contacts: 28, views: 12970 },
        { month: 'Jun', contacts: totalContacts, views: monthlyViews }
      ],
      
      // Weekly breakdown
      weeklyStats: [
        { week: 'Week 1', contacts: Math.floor(newContacts * 0.3), views: Math.floor(weeklyViews * 0.25) },
        { week: 'Week 2', contacts: Math.floor(newContacts * 0.25), views: Math.floor(weeklyViews * 0.22) },
        { week: 'Week 3', contacts: Math.floor(newContacts * 0.25), views: Math.floor(weeklyViews * 0.28) },
        { week: 'Week 4', contacts: Math.floor(newContacts * 0.2), views: Math.floor(weeklyViews * 0.25) }
      ],
      
      // Traffic sources
      trafficSources: [
        { source: 'Organic Search', percentage: 45.2, visitors: Math.floor(totalViews * 0.452) },
        { source: 'Social Media', percentage: 28.7, visitors: Math.floor(totalViews * 0.287) },
        { source: 'Direct', percentage: 15.8, visitors: Math.floor(totalViews * 0.158) },
        { source: 'Referral', percentage: 10.3, visitors: Math.floor(totalViews * 0.103) }
      ],
      
      // Geographic data
      topCountries: [
        { country: 'United States', percentage: 42.1, visitors: Math.floor(totalViews * 0.421) },
        { country: 'Canada', percentage: 18.3, visitors: Math.floor(totalViews * 0.183) },
        { country: 'United Kingdom', percentage: 12.7, visitors: Math.floor(totalViews * 0.127) },
        { country: 'Australia', percentage: 8.9, visitors: Math.floor(totalViews * 0.089) },
        { country: 'Germany', percentage: 6.2, visitors: Math.floor(totalViews * 0.062) },
        { country: 'Others', percentage: 11.8, visitors: Math.floor(totalViews * 0.118) }
      ],
      
      // Device breakdown
      deviceStats: [
        { device: 'Desktop', percentage: 52.3, visitors: Math.floor(totalViews * 0.523) },
        { device: 'Mobile', percentage: 39.8, visitors: Math.floor(totalViews * 0.398) },
        { device: 'Tablet', percentage: 7.9, visitors: Math.floor(totalViews * 0.079) }
      ],
      
      // Performance metrics
      performance: {
        averageLoadTime: '1.2s',
        firstContentfulPaint: '0.8s',
        largestContentfulPaint: '1.4s',
        cumulativeLayoutShift: 0.05,
        timeToInteractive: '1.6s'
      },
      
      // Content metrics
      contentMetrics: {
        totalPages: 12,
        activePages: 10,
        blogPosts: 8,
        averageTimeOnPage: '3m 42s',
        pagesPerSession: 2.8
      },
      
      // Real-time data
      realTimeData: {
        activeUsers: Math.floor(Math.random() * 15) + 5, // 5-20 active users
        currentPageViews: Math.floor(Math.random() * 50) + 20, // 20-70 current page views
        onlineVisitors: Math.floor(Math.random() * 25) + 10 // 10-35 online visitors
      },
      
      // Timestamps
      lastUpdated: new Date().toISOString(),
      dataRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        end: new Date().toISOString()
      }
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

// Add CMS-specific analytics endpoint
app.get('/cms-analytics', async (req, res) => {
  try {
    logger.info('admin-service', 'Fetching CMS analytics');
    
    // Simulate content statistics
    const totalContent = 24; // services + projects + testimonials
    const activeContent = 20;
    const contentViews = Math.floor(Math.random() * 5000) + 15000; // 15k-20k content views
    
    const cmsAnalytics = {
      contentOverview: {
        totalViews: contentViews,
        totalContent,
        activeContent,
        contentHealth: Math.round((activeContent / totalContent) * 100),
        monthlyGrowth: 18.5,
        engagementRate: 76.3
      },
      
      seoMetrics: {
        overallScore: 92,
        technicalSeo: 95,
        contentSeo: 89,
        userExperience: 94,
        recommendations: [
          'Add meta descriptions to 2 pages',
          'Optimize images for faster loading',
          'Improve internal linking structure'
        ]
      },
      
      contentPerformance: {
        topPerformingContent: [
          { title: 'Web Development Services', views: Math.floor(contentViews * 0.25), type: 'service' },
          { title: 'E-commerce Platform Project', views: Math.floor(contentViews * 0.18), type: 'project' },
          { title: 'UI/UX Design Services', views: Math.floor(contentViews * 0.15), type: 'service' },
          { title: 'Client Testimonials', views: Math.floor(contentViews * 0.12), type: 'testimonial' }
        ],
        averageViewsPerContent: Math.floor(contentViews / totalContent),
        contentCompletionRate: 89.2
      },
      
      userEngagement: {
        averageTimeOnContent: '4m 18s',
        scrollDepth: 78.5,
        socialShares: Math.floor(Math.random() * 100) + 50,
        comments: Math.floor(Math.random() * 25) + 10,
        bookmarks: Math.floor(Math.random() * 40) + 15
      },
      
      conversionMetrics: {
        contactFormSubmissions: mockContacts.length,
        conversionRate: 3.2,
        leadQuality: 'High',
        averageLeadValue: '$2,450'
      },
      
      lastUpdated: new Date().toISOString()
    };
    
    res.json(cmsAnalytics);
    
  } catch (error) {
    logger.error('admin-service', 'Error fetching CMS analytics', error);
    res.status(500).json({
      error: 'Failed to fetch CMS analytics',
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