// ACTIVIDAD 2: Incremento progresivo — se ejecuta una vez por escenario:
//   k6 run -e VUS=50  -e DURATION=2m ...
//   k6 run -e VUS=100 -e DURATION=2m ...
//   k6 run -e VUS=250 -e DURATION=2m ...
//   k6 run -e VUS=500 -e DURATION=2m ...
import { sleep } from 'k6';
import { login, enviarNotificacion, guardarResumen, SUMMARY_STATS } from './lib/common.js';

const VUS = parseInt(__ENV.VUS || '50');

export const options = {
  vus: VUS,
  duration: __ENV.DURATION || '2m',
  summaryTrendStats: SUMMARY_STATS,
};

export function setup() { return login(); }

export default function (data) {
  enviarNotificacion(data.token);
  sleep(1);
}

export function handleSummary(data) { return guardarResumen(data, `02-incremento-${VUS}vus`); }
