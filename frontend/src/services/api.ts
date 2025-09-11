import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (username: string, password: string) =>
    apiClient.post('/auth/login', { username, password }),
  
  validateToken: (token: string) =>
    apiClient.post('/auth/validate', {}, {
      headers: { Authorization: `Bearer ${token}` }
    }),
};

export const creatorAPI = {
  getCreators: (params: any) =>
    apiClient.get('/creators', { params }),
  
  getCreatorById: (id: string) =>
    apiClient.get(`/creators/${id}`),
  
  createCreator: (data: any) =>
    apiClient.post('/creators', data),
  
  updateCreator: (id: string, data: any) =>
    apiClient.put(`/creators/${id}`, data),
  
  deleteCreator: (id: string) =>
    apiClient.delete(`/creators/${id}`),
  
  addInteraction: (creatorId: string, data: any) =>
    apiClient.post(`/creators/${creatorId}/interactions`, data),
};

export default apiClient;