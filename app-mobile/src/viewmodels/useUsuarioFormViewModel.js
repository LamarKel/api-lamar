import { useState } from 'react';
import { UsuarioRepository } from '../repositories/UsuarioRepository';

export function useUsuarioFormViewModel(usuario, onDone) {
  const editando = !!usuario;
  const [nombre, setNombre] = useState(usuario?.nombre ?? '');
  const [email, setEmail] = useState(usuario?.email ?? '');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState(usuario?.telefono ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const guardar = async () => {
    if (!nombre.trim()) return setError('El nombre es obligatorio');
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Email inválido');
    if (password.length < 6) return setError('La contraseña debe tener mínimo 6 caracteres');
    if (telefono && !/^[0-9\-\s()+]{7,15}$/.test(telefono)) return setError('Teléfono inválido');
    setLoading(true); setError(null);
    try {
      editando ? await UsuarioRepository.actualizar(usuario.id, nombre, email, password, telefono)
        : await UsuarioRepository.crear(nombre, email, password, telefono);
      onDone();
    } catch (e) { setError(e.response?.data?.message || 'Error al guardar'); }
    finally { setLoading(false); }
  };
  return { editando, nombre, setNombre, email, setEmail, password, setPassword, telefono, setTelefono, loading, error, guardar };
}
