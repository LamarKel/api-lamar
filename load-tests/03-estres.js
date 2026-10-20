// ACTIVIDAD 4: Prueba de estrés — sube la carga por escalones hasta encontrar el punto
// de degradación. Se DETIENE sola si:
//   - más de 5% de errores
//   - P95 de latencia mayor a 5 segundos
// (el throttling de Lambda aparece como respuestas 429/5xx, contadas aparte)
import { sleep } from 'k6';
import { login, enviarNotificacion, guardarResumen, SUMMARY_STATS } from './lib/common.js';

const ESCALON = __ENV.STEP || '1m'; // tiempo en cada nivel de carga

export const options = {
  scenarios: {
    estres: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 100 },  { duration: ESCALON, target: 100 },
        { duration: '20s', target: 250 },  { duration: ESCALON, target: 250 },
        { duration: '20s', target: 500 },  { duration: ESCALON, target: 500 },
        { duration: '20s', target: 750 },  { duration: ESCALON, target: 750 },
        { duration: '20s', target: 1000 }, { duration: ESCALON, target: 1000 },
        { duration: '20s', target: 1500 }, { duration: ESCALON, target: 1500 },
        { duration: '20s', target: 2000 }, { duration: ESCALON, target: 2000 },
        { duration: '20s', target: 0 },
      ],
      gracefulRampDown: '10s',
    },
  },
  thresholds: {
    http_req_failed:   [{ threshold: 'rate<0.05', abortOnFail: true, delayAbortEval: '30s' }],
    http_req_duration: [{ threshold: 'p(95)<5000', abortOnFail: true, delayAbortEval: '30s' }],
  },
  summaryTrendStats: SUMMARY_STATS,
};

export function setup() { return login(); }

export default function (data) {
  enviarNotificacion(data.token);
  sleep(1);
}

export function handleSummary(data) { return guardarResumen(data, '03-estres'); }
