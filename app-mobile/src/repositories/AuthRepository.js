import { AuthService } from '../services/AuthService';
import { TokenStorage } from '../services/TokenStorage';
import { LoginRequest, UsuarioRequest } from '../models/Usuario';

export const AuthRepository = {
  async login(email, password) {
    const { data } = await AuthService.login(LoginRequest(email, password));
    await TokenStorage.save(data.token);
    return data.token;
  },
  registro: (nombre, email, password) => AuthService.registro(UsuarioRequest(nombre, email, password)),
  logout: () => TokenStorage.clear(),
  isLogged: async () => !!(await TokenStorage.get()),
};
