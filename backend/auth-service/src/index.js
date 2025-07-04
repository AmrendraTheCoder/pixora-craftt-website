import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.AUTH_SERVICE_PORT || 4001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'auth-service',
    status: 'healthy',
    timestamp: new Date(),
    port: PORT
  });
});

// Basic auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple admin login for demo
  if (email === 'admin@pixora-craftt.com' && password === 'AdminPassword123!') {
    res.json({
      success: true,
      data: {
        accessToken: 'mock-admin-token',
        user: {
          id: '1',
          email: 'admin@pixora-craftt.com',
          role: 'admin',
          name: 'Admin User'
        }
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
});

app.post('/api/auth/verify', (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: '1',
        email: 'admin@pixora-craftt.com',
        role: 'admin',
        name: 'Admin User'
      }
    }
  });
});

app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
}); 