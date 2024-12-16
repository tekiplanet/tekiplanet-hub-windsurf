import axios, { AxiosError } from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Interceptor to add token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('Axios Interceptor - Token:', {
    token: token ? 'Present' : 'Not Found',
    fullToken: token ? `Bearer ${token}` : null,
    url: config.url
  });
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add isAxiosError method
export const isAxiosError = axios.isAxiosError;

export { apiClient };
export default apiClient;
