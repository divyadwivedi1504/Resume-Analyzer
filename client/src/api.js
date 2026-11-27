import axios from 'axios';

// Local: empty -> "/api" (Vite proxy). Production: set VITE_API_URL=https://your-backend.onrender.com
const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const api = axios.create({ baseURL: `${API_URL}/api` });

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('resumeiq_user') || 'null');
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

export const errMsg = (e) => e?.response?.data?.message || e.message || 'Something went wrong';

export default api;
