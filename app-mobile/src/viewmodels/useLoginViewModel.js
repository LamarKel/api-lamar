import { useState } from 'react';
import { AuthRepository } from '../repositories/AuthRepository';

export function useLoginViewModel(onSuccess) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [modoRegistro, setModoRegistro] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    if (!email || !password || (modoRegistro && !nombre)) return setError('Completa todos los campos');
    setLoading(true); setError(null);
    try {
      if (modoRegistro) await AuthRepository.registro(nombre, email, password);
      await AuthRepository.login(email, password);
      onSuccess();
    } catch (e) {
      setError(e.response?.status === 401 || e.response?.status === 403 ? 'Credenciales inválidas' : 'No se pudo conectar con el servidor');
    } finally { setLoading(false); }
  };
  return { email, setEmail, password, setPassword, nombre, setNombre, modoRegistro, setModoRegistro, loading, error, submit };
}
