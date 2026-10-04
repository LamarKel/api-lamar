import axios from 'axios';
import { API_URL } from '../config/api';
import { TokenStorage } from './TokenStorage';

export const http = axios.create({ baseURL: API_URL, timeout: 60000 });

let onUnauthorized = () => { };
export const setOnUnauthorized = (fn) => { onUnauthorized = fn; };

// Interceptor: agrega el JWT a cada petición
http.interceptors.request.use(async (config) => {
  const token = await TokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor: si el token expiró o es inválido → logout
http.interceptors.response.use(
  (r) => r,
  async (error) => {
    const s = error.response?.status;
    if ((s === 401 || s === 403) && !error.config.url.includes('/auth/')) {
      await TokenStorage.clear();
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);
