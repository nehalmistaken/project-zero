import axios from 'axios';

// Backend base URL (fall back to localhost:5000 if env not set)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically inject JWT token into the Authorization header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('citizen_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors globally (e.g. redirect on unauthorized)
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || (error.response ? 'The request could not be completed. Please try again.' : 'Cannot reach the local API. Start the Flask service on port 5000, or use the local guest workspace.');
    
    // If token expired or unauthorized, clean local storage
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      // If we are in admin pages, we might want to reload to force redirect to login
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    
    return Promise.reject({
      message,
      status: error.response?.status,
      originalError: error
    });
  }
);

const connectedApi = {
  // Auth
  login: (username, password) => {
    return apiClient.post('/auth/login', { username, password });
  },
  
  // Real-time AI prediction (preview)
  predict: (complaintText) => {
    return apiClient.post('/predict', { complaint_text: complaintText });
  },
  
  // Submit complaint (saves to DB)
  submitComplaint: (complaintData) => {
    return apiClient.post('/submit-complaint', complaintData);
  },
  
  // Get all complaints with filters/pagination
  getComplaints: (params) => {
    return apiClient.get('/get-complaints', { params });
  },

  getComplaintByGrievanceId: (grievanceId) => {
    return apiClient.get(`/get-complaints/by-grievance-id/${encodeURIComponent(grievanceId)}`);
  },

  getComplaintHistory: (id) => {
    return apiClient.get(`/get-complaints/${id}/history`);
  },
  
  // Admin: Update complaint status
  updateComplaintStatus: (id, status, remark) => {
    return apiClient.put(`/update-status/${id}`, { status, remark });
  },

  updateComplaintDepartment: (id, department) => {
    return apiClient.put(`/update-department/${id}`, { department });
  },

  escalateComplaint: (id, reason) => {
    return apiClient.post(`/escalate/${id}`, { reason });
  },
  
  // Admin: Fetch stats for charts
  getDashboardStats: () => {
    return apiClient.get('/dashboard-stats');
  },

  // Notifications API
  getNotifications: (params) => {
    return apiClient.get('/notifications', { params });
  },

  markNotificationAsRead: (id) => {
    return apiClient.put(`/notifications/${id}/read`);
  },

  markAllNotificationsAsRead: () => {
    return apiClient.put('/notifications/read-all');
  }
};

export const apiService = Object.fromEntries(Object.entries(connectedApi).map(([name,fn]) => [name,(...args) => sessionStorage.getItem('project_mode') === 'local' && ['predict','submitComplaint','getComplaints','getComplaintByGrievanceId','getComplaintHistory','getNotifications','markNotificationAsRead','markAllNotificationsAsRead'].includes(name) ? import('./localApi').then(({localApi})=>localApi[name](...args)) : fn(...args)]));
export default apiService;
