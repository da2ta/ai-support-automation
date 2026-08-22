import axios from 'axios';
import { supabase } from './auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Supabase JWT token to every request
apiClient.interceptors.request.use(async (config) => {
  const { data: { session } } = supabase
    ? await supabase.auth.getSession()
    : { data: { session: null } };
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});
