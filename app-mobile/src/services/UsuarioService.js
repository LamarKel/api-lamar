import { http } from './HttpClient';
export const UsuarioService = {
  listar: () => http.get('/api/usuarios'),
  obtener: (id) => http.get(`/api/usuarios/${id}`),
  actualizar: (id, req) => http.put(`/api/usuarios/${id}`, req),
  eliminar: (id) => http.delete(`/api/usuarios/${id}`),
  perfil: () => http.get('/api/perfil'),
  config: () => http.get('/api/config'),
};
