import { UsuarioService } from '../services/UsuarioService';
import { FileService } from '../services/FileService';
import { AuthService } from '../services/AuthService';
import { Usuario, UsuarioRequest } from '../models/Usuario';
import { Archivo } from '../models/Archivo';

export const UsuarioRepository = {
  async listar() { const { data } = await UsuarioService.listar(); return data.map(Usuario.fromJson); },
  async crear(n, e, p, t) { const { data } = await AuthService.registro(UsuarioRequest(n, e, p, t)); return Usuario.fromJson(data); },
  async actualizar(id, n, e, p, t) { const { data } = await UsuarioService.actualizar(id, UsuarioRequest(n, e, p, t)); return Usuario.fromJson(data); },
  eliminar: (id) => UsuarioService.eliminar(id),

  // ===== CONSUMO PARALELO con Promise.all =====
  async cargarDashboard() {
    const inicio = Date.now();
    const [usuarios, perfil, config, archivos] = await Promise.all([
      UsuarioService.listar(),
      UsuarioService.perfil(),
      UsuarioService.config(),
      FileService.listar(),
    ]);
    const msParalelo = Date.now() - inicio;
    return {
      usuarios: usuarios.data.map(Usuario.fromJson),
      perfil: perfil.data,
      config: config.data,
      archivos: archivos.data.map(Archivo.fromJson),
      msParalelo,
    };
  },

  // Versión secuencial solo para comparar tiempos en la exposición
  async medirSecuencial() {
    const inicio = Date.now();
    await UsuarioService.listar(); await UsuarioService.perfil();
    await UsuarioService.config(); await FileService.listar();
    return Date.now() - inicio;
  },
};
