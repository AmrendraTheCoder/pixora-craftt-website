// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

// API Response type
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// API Error class
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Base API fetch function with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Get auth token from localStorage if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data: ApiResponse<T> = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error || `HTTP ${response.status}`,
        response.status,
        data
      );
    }

    if (!data.success) {
      throw new ApiError(data.error || 'API request failed', response.status, data);
    }

    return data.data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0
    );
  }
}

// Contact API
export const contactApi = {
  // Submit contact form
  async submitContactForm(contactData: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) {
    return apiRequest('/admin/contact/submit', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  },

  // Get all contacts (admin only)
  async getContacts(params?: {
    page?: number;
    limit?: number;
    status?: 'new' | 'read' | 'replied' | 'closed';
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status) searchParams.set('status', params.status);

    const queryString = searchParams.toString();
    const endpoint = `/admin/contact${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(endpoint);
  },

  // Update contact status (admin only)
  async updateContactStatus(contactId: number, status: 'new' | 'read' | 'replied' | 'closed') {
    return apiRequest(`/admin/contact/${contactId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Delete contact (admin only)
  async deleteContact(contactId: number) {
    return apiRequest(`/admin/contact/${contactId}`, {
      method: 'DELETE',
    });
  }
};

// CMS API
export const cmsApi = {
  // Services
  async getServices() {
    return apiRequest('/cms/services');
  },

  async createService(serviceData: any) {
    return apiRequest('/cms/services', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  },

  async updateService(serviceId: string, serviceData: any) {
    return apiRequest(`/cms/services/${serviceId}`, {
      method: 'PUT',
      body: JSON.stringify(serviceData),
    });
  },

  async deleteService(serviceId: string) {
    return apiRequest(`/cms/services/${serviceId}`, {
      method: 'DELETE',
    });
  },

  // Projects
  async getProjects() {
    return apiRequest('/cms/projects');
  },

  async createProject(projectData: any) {
    return apiRequest('/cms/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },

  async updateProject(projectId: string, projectData: any) {
    return apiRequest(`/cms/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  },

  async deleteProject(projectId: string) {
    return apiRequest(`/cms/projects/${projectId}`, {
      method: 'DELETE',
    });
  },

  // Testimonials
  async getTestimonials() {
    return apiRequest('/cms/testimonials');
  },

  async createTestimonial(testimonialData: any) {
    return apiRequest('/cms/testimonials', {
      method: 'POST',
      body: JSON.stringify(testimonialData),
    });
  },

  async updateTestimonial(testimonialId: string, testimonialData: any) {
    return apiRequest(`/cms/testimonials/${testimonialId}`, {
      method: 'PUT',
      body: JSON.stringify(testimonialData),
    });
  },

  async deleteTestimonial(testimonialId: string) {
    return apiRequest(`/cms/testimonials/${testimonialId}`, {
      method: 'DELETE',
    });
  },

  // Media upload
  async uploadMedia(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return apiRequest('/cms/media/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }
};

// Analytics API
export const analyticsApi = {
  // Track analytics event
  async trackEvent(type: 'page_view' | 'contact_form' | 'project_view' | 'service_inquiry', data?: any) {
    return apiRequest('/admin/analytics/track', {
      method: 'POST',
      body: JSON.stringify({ type, data }),
    });
  },

  // Get analytics overview (admin only)
  async getOverview(period: 'today' | 'week' | 'month' | 'year' = 'month') {
    return apiRequest(`/admin/analytics/overview?period=${period}`);
  },

  // Get detailed analytics (admin only)
  async getDetailed(params?: {
    type?: string;
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.set('type', params.type);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);

    const queryString = searchParams.toString();
    const endpoint = `/admin/analytics/detailed${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(endpoint);
  },

  // Get analytics stats (admin only)
  async getStats() {
    return apiRequest('/admin/analytics/stats');
  }
};

// Auth API
export const authApi = {
  // Register
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Login
  async login(credentials: {
    email: string;
    password: string;
  }) {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store auth token
    if (response.accessToken) {
      localStorage.setItem('auth_token', response.accessToken);
      localStorage.setItem('refresh_token', response.refreshToken);
    }

    return response;
  },

  // Logout
  async logout() {
    try {
      await apiRequest('/auth/logout', {
        method: 'POST',
      });
    } finally {
      // Always clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    }
  },

  // Refresh token
  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new ApiError('No refresh token available', 401);
    }

    const response = await apiRequest('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    if (response.accessToken) {
      localStorage.setItem('auth_token', response.accessToken);
    }

    return response;
  },

  // Get current user
  async getCurrentUser() {
    return apiRequest('/auth/me');
  },

  // Password reset
  async requestPasswordReset(email: string) {
    return apiRequest('/auth/password-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token: string, newPassword: string) {
    return apiRequest('/auth/password-reset/confirm', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }
};

// System API  
export const systemApi = {
  // Get system health
  async getHealth() {
    return apiRequest('/admin/system/health');
  },

  // Get service statuses
  async getServices() {
    return apiRequest('/admin/system/services');
  },

  // Get system logs
  async getLogs(params?: {
    level?: string;
    service?: string;
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.level) searchParams.set('level', params.level);
    if (params?.service) searchParams.set('service', params.service);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);

    const queryString = searchParams.toString();
    const endpoint = `/admin/system/logs${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(endpoint);
  }
};

// Utility function to check if user is authenticated
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('auth_token');
}

// Export ApiError for external use
export { ApiError }; 