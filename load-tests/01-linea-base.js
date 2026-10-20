// ACTIVIDAD 1: Línea base — 10 usuarios virtuales durante 1 minuto
import { sleep } from 'k6';
import { login, enviarNotificacion, guardarResumen, SUMMARY_STATS } from './lib/common.js';

export const options = {
  vus: 10,
  duration: '1m',
  summaryTrendStats: SUMMARY_STATS,
};

export function setup() { return login(); }

export default function (data) {
  enviarNotificacion(data.token);
  sleep(1); // tiempo de espera entre acciones de un usuario real
}

export function handleSummary(data) { return guardarResumen(data, '01-linea-base'); }
