// Entidad y DTOs de Usuario
export class Usuario {
  constructor({ id, nombre, email, telefono }) { this.id = id; this.nombre = nombre; this.email = email; this.telefono = telefono; }
  static fromJson(json) { return new Usuario(json); }
}
export const UsuarioRequest = (nombre, email, password, telefono) => ({ nombre, email, password, telefono });
export const LoginRequest = (email, password) => ({ email, password });
