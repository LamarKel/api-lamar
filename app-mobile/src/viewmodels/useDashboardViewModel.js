import { useState, useCallback } from 'react';
import { UsuarioRepository } from '../repositories/UsuarioRepository';

export function useDashboardViewModel() {
  const [state, setState] = useState({ loading: false, error: null, data: null, msSecuencial: null });

  const cargar = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await UsuarioRepository.cargarDashboard();
      setState((s) => ({ ...s, loading: false, data }));
    } catch { setState((s) => ({ ...s, loading: false, error: 'Error cargando datos' })); }
  }, []);

  const compararSecuencial = async () => {
    const ms = await UsuarioRepository.medirSecuencial();
    setState((s) => ({ ...s, msSecuencial: ms }));
  };
  return { ...state, cargar, compararSecuencial };
}
