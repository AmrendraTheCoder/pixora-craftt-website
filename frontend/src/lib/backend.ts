// Backend Services Integration
// This replaces Supabase with our microservices backend

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
const AUTH_ENABLED = import.meta.env.VITE_AUTH_ENABLED === 'true';
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@pixora-craftt.com';
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'AdminPassword123!';

// Types for our backend integration
export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  status: 'new' | 'contacted' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  features: string[];
  icon?: string;
  color: string;
  image?: string;
  caseStudyLink?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  category: 'web' | 'mobile' | 'uiux' | 'marketing';
  description: string;
  fullDescription?: string;
  image?: string;
  tags: string[];
  clientName?: string;
  projectUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  avatar?: string;
  rating: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Helper function
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    timeout: 10000, // 10 second timeout
    ...options,
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} - ${response.statusText}`);
  }
  
  return response.json();
}

// Auth Service
export const authService = {
  async login(email: string, password: string): Promise<{ success: boolean; token?: string; user?: any }> {
    try {
      const response = await apiRequest<any>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      if (response.token) {
        localStorage.setItem('auth-token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        return { success: true, token: response.token, user: response.user };
      }
      
      return { success: false };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false };
    }
  },

  async logout(): Promise<void> {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user');
  },

  getToken(): string | null {
    return localStorage.getItem('auth-token');
  },

  getCurrentUser(): any | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  // Demo authentication for testing
  async demoLogin(): Promise<{ success: boolean; token?: string; user?: any }> {
    const user = {
      id: 'admin-1',
      email: ADMIN_EMAIL,
      name: 'Admin User',
      role: 'admin',
    };
    
    const token = 'demo-token-' + Date.now();
    localStorage.setItem('auth-token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { success: true, token, user };
  }
};

// CMS Service
export const cmsService = {
  // Services
  async getServices(): Promise<Service[]> {
    try {
      const response = await apiRequest<any>('/api/services');
      return response.data || response || mockData.services;
    } catch (error) {
      console.warn('CMS API not available, using mock data');
      return mockData.services;
    }
  },

  async createService(service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<Service> {
    try {
      return await apiRequest<Service>('/api/services', {
        method: 'POST',
        body: JSON.stringify(service),
      });
    } catch (error) {
      console.warn('CMS API not available, creating mock service');
      const newService: Service = {
        ...service,
        id: 'service-' + Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return newService;
    }
  },

  async updateService(id: string, updates: Partial<Service>): Promise<Service> {
    try {
      return await apiRequest<Service>(`/api/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.warn('CMS API not available, returning mock update');
      return { ...updates, id, updatedAt: new Date().toISOString() } as Service;
    }
  },

  async deleteService(id: string): Promise<void> {
    try {
      await apiRequest(`/api/services/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.warn('CMS API not available, mock delete');
    }
  },

  // Projects
  async getProjects(): Promise<Project[]> {
    try {
      const response = await apiRequest<any>('/api/projects');
      return response.data || response || mockData.projects;
    } catch (error) {
      console.warn('CMS API not available, using mock data');
      return mockData.projects;
    }
  },

  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    try {
      return await apiRequest<Project>('/api/projects', {
        method: 'POST',
        body: JSON.stringify(project),
      });
    } catch (error) {
      console.warn('CMS API not available, creating mock project');
      const newProject: Project = {
        ...project,
        id: 'project-' + Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return newProject;
    }
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    try {
      return await apiRequest<Project>(`/api/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.warn('CMS API not available, returning mock update');
      return { ...updates, id, updatedAt: new Date().toISOString() } as Project;
    }
  },

  async deleteProject(id: string): Promise<void> {
    try {
      await apiRequest(`/api/projects/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.warn('CMS API not available, mock delete');
    }
  },

  // Testimonials
  async getTestimonials(): Promise<Testimonial[]> {
    try {
      const response = await apiRequest<any>('/api/testimonials');
      return response.data || response || mockData.testimonials;
    } catch (error) {
      console.warn('CMS API not available, using mock data');
      return mockData.testimonials;
    }
  },

  async createTestimonial(testimonial: Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'>): Promise<Testimonial> {
    try {
      return await apiRequest<Testimonial>('/api/testimonials', {
        method: 'POST',
        body: JSON.stringify(testimonial),
      });
    } catch (error) {
      console.warn('CMS API not available, creating mock testimonial');
      const newTestimonial: Testimonial = {
        ...testimonial,
        id: 'testimonial-' + Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return newTestimonial;
    }
  },

  async updateTestimonial(id: string, updates: Partial<Testimonial>): Promise<Testimonial> {
    try {
      return await apiRequest<Testimonial>(`/api/testimonials/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.warn('CMS API not available, returning mock update');
      return { ...updates, id, updatedAt: new Date().toISOString() } as Testimonial;
    }
  },

  async deleteTestimonial(id: string): Promise<void> {
    try {
      await apiRequest(`/api/testimonials/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.warn('CMS API not available, mock delete');
    }
  },
};

// Admin Service
export const adminService = {
  async getContacts(): Promise<Contact[]> {
    try {
      return await apiRequest<Contact[]>('/api/admin/contacts');
    } catch (error) {
      console.warn('Admin API not available, using mock data');
      return mockData.contacts;
    }
  },

  async updateContactStatus(id: string, status: Contact['status']): Promise<Contact> {
    try {
      return await apiRequest<Contact>(`/api/admin/contacts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      console.warn('Admin API not available, returning mock update');
      return { id, status, updatedAt: new Date().toISOString() } as Contact;
    }
  },

  async deleteContact(id: string): Promise<void> {
    try {
      await apiRequest(`/api/admin/contacts/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.warn('Admin API not available, mock delete');
    }
  },

  async getAnalytics(): Promise<any> {
    try {
      return await apiRequest('/api/admin/analytics');
    } catch (error) {
      console.warn('Admin API not available, using mock analytics');
      return {
        totalContacts: mockData.contacts.length,
        newContacts: mockData.contacts.filter(c => c.status === 'new').length,
        completedContacts: mockData.contacts.filter(c => c.status === 'completed').length,
        monthlyStats: [],
      };
    }
  },
};

// Mock data fallback
export const mockData = {
  services: [
    {
      id: "service-1",
      title: "Web Development",
      description: "Custom websites built with modern technologies that are fast, responsive, and optimized for search engines.",
      features: [
        "Responsive design for all devices",
        "SEO-optimized code structure", 
        "Fast loading speeds",
        "Secure and scalable architecture",
      ],
      color: "bg-blue-500",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "service-2",
      title: "UI/UX Design",
      description: "Intuitive and engaging user experiences that guide visitors through your digital products with ease.",
      features: [
        "User-centered design approach",
        "Intuitive navigation systems",
        "Visually appealing interfaces",
        "Conversion-focused layouts",
      ],
      color: "bg-purple-500",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "service-3",
      title: "Social Media Marketing",
      description: "Strategic social media campaigns that increase brand awareness and drive engagement with your target audience.",
      features: [
        "Platform-specific content strategies",
        "Community engagement tactics",
        "Performance analytics and reporting",
        "Paid advertising management",
      ],
      color: "bg-green-500",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ] as Service[],
  
  projects: [
    {
      id: "project-1",
      title: "E-Commerce Website Redesign",
      category: "web" as const,
      description: "Complete redesign and development of an e-commerce platform with custom shopping cart and payment integration.",
      fullDescription: "This project involved a complete overhaul of an outdated e-commerce platform. We implemented a modern React frontend with a Node.js backend, integrated Stripe for secure payments, and ensured the site was fully responsive across all devices.",
      image: "https://images.unsplash.com/photo-1661956602116-aa6865609028?w=800&q=80",
      tags: ["React", "Node.js", "Stripe", "Responsive"],
      clientName: "Fashion Retailer",
      projectUrl: "#",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "project-2",
      title: "Mobile App UI Design",
      category: "uiux" as const,
      description: "User interface and experience design for a fitness tracking mobile application with custom iconography.",
      fullDescription: "We created a comprehensive UI/UX design for a fitness tracking application, focusing on intuitive user flows and engaging visual elements.",
      image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80",
      tags: ["Figma", "UI Design", "Mobile", "Prototyping"],
      clientName: "FitTech Startup",
      projectUrl: "#",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ] as Project[],
  
  testimonials: [
    {
      id: "testimonial-1",
      name: "Sarah Johnson",
      role: "Marketing Director",
      company: "TechCorp Inc.",
      content: "Pixora Craftt transformed our digital presence completely. Their attention to detail and innovative approach exceeded our expectations.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      rating: 5,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "testimonial-2",
      name: "Michael Chen",
      role: "CEO",
      company: "StartupXYZ",
      content: "The team at Pixora Craftt delivered exceptional results. Our website traffic increased by 300% after the redesign.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
      rating: 5,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ] as Testimonial[],
  
  contacts: [
    {
      id: "contact-1",
      name: "John Smith",
      email: "john.smith@example.com",
      phone: "+1 (555) 123-4567",
      company: "Tech Solutions Inc.",
      message: "Hi, I'm interested in your web development services for our company website redesign.",
      status: "new" as const,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "contact-2", 
      name: "Emily Davis",
      email: "emily.davis@startup.com",
      phone: "+1 (555) 987-6543",
      company: "Innovation Startup",
      message: "We need help with UI/UX design for our mobile app. Can we schedule a consultation?",
      status: "contacted" as const,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "contact-3",
      name: "Robert Wilson",
      email: "robert@business.com",
      company: "Local Business",
      message: "Looking for social media marketing services to grow our online presence.",
      status: "completed" as const,
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      updatedAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ] as Contact[],
};

// Check if backend is configured
export const isBackendConfigured = () => {
  return !!API_BASE_URL && API_BASE_URL !== 'http://localhost:4000';
};

// Check if auth is enabled
export const isAuthEnabled = () => AUTH_ENABLED; 