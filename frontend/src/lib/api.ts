import axios from 'axios';

// Browser calls same-origin /api (proxied by Next.js). Server-side can hit the API directly.
const apiBaseURL =
  typeof window === 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
    : '/api';

const api = axios.create({
  baseURL: apiBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for handling token refresh could be added here

export default api;
