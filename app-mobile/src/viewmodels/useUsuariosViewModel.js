import { useState, useCallback } from 'react';
import { UsuarioRepository } from '../repositories/UsuarioRepository';

export function useUsuariosViewModel() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const cargar = useCallback(async () => {
    setLoading(true); setError(null);
    try { setUsuarios(await UsuarioRepository.listar()); }
    catch { setError('No se pudieron cargar los usuarios'); }
    finally { setLoading(false); }
  }, []);

  const eliminar = async (id) => {
    await UsuarioRepository.eliminar(id);
    setUsuarios((u) => u.filter((x) => x.id !== id));
  };
  return { usuarios, loading, error, cargar, eliminar };
}
