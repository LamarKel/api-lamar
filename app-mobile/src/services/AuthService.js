import { http } from './HttpClient';
export const AuthService = {
  login: (req) => http.post('/api/auth/login', req),
  registro: (req) => http.post('/api/auth/registro', req),
};
