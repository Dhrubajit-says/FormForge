import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: (credentials) => api.post('/api/auth/login', credentials),
  loadUser: () => api.get('/api/auth'),
  changePassword: (passwordData) => api.put('/api/auth/change-password', passwordData)
};

export const templateAPI = {
  createTemplate: (templateData) => api.post('/api/templates', templateData),
  getTemplates: () => api.get('/api/templates'),
  getTemplate: (id) => api.get(`/api/templates/${id}`),
  updateTemplate: (id, templateData) => api.put(`/api/templates/${id}`, templateData),
  deleteTemplate: (id) => api.delete(`/api/templates/${id}`),
  searchTemplates: (query) => {
    if (!query) return Promise.resolve({ data: [] });
    return api.get(`/api/templates/search?q=${encodeURIComponent(query)}`);
  },
  getAnswerScripts: () => api.get('/api/answer-scripts'),
  getAnswerScript: (id) => api.get(`/api/answer-scripts/${id}`),
  submitAnswerScript: (data) => api.post('/api/answer-scripts', data),
  getSharedTemplate: (id) => api.get(`/api/templates/share/${id}`),
  deleteAnswerScript: (id) => {
    console.log('Deleting answer script with ID:', id);
    return api.delete(`/api/answer-scripts/${id}`);
  },
  updateAnswerScript: (scriptId, updateData) => 
    api.put(`/api/answer-scripts/${scriptId}`, updateData),
  getStats: async () => {
    try {
      const response = await api.get('/api/templates/stats');
      return response;
    } catch (error) {
      throw error;
    }
  },
};

// Add admin-specific API calls
export const adminAPI = {
  // ... existing admin endpoints

  // Add this new method for admin template management
  getTemplateAsAdmin: (templateId) => {
    const token = localStorage.getItem('token');
    return api.get(`/api/admin/templates/${templateId}`, {
      headers: {
        'x-auth-token': token
      }
    });
  },
  updateTemplateAsAdmin: async (templateId, templateData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.put(
        `/api/admin/templates/${templateId}`, 
        templateData,
        {
          headers: {
            'x-auth-token': token
          }
        }
      );
      return response;
    } catch (error) {
      console.error('Admin template update error:', error.response?.data || error);
      throw error;
    }
  },
  deleteTemplateAsAdmin: (templateId) => {
    const token = localStorage.getItem('token');
    return api.delete(`/api/admin/templates/${templateId}`, {
      headers: {
        'x-auth-token': token
      }
    });
  },
  getUsers: () => api.get('/api/admin/users'),
  deleteUser: (userId) => api.delete(`/api/admin/users/${userId}`),
  toggleUserBlock: (userId) => api.put(`/api/admin/users/${userId}/block`),
  toggleUserRole: (userId) => api.put(`/api/admin/users/${userId}/role`),
  getUserTemplates: (userId) => api.get(`/api/admin/users/${userId}/templates`),
};

export const statsAPI = {
  getDashboardStats: () => api.get('/api/stats/dashboard')
};

export default api; 