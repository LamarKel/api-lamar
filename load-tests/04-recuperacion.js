// ACTIVIDAD 5: Prueba de recuperación — carga alta durante 2 minutos y se detiene de golpe.
// Al terminar, anota la HORA EXACTA que imprime k6 y observa en CloudWatch:
//   - cuánto tarda SQS (ApproximateNumberOfMessagesVisible) en volver a 0
//   - cuándo baja a 0 ConcurrentExecutions de las Lambdas
import { sleep } from 'k6';
import { login, enviarNotificacion, guardarResumen, SUMMARY_STATS } from './lib/common.js';

const VUS = parseInt(__ENV.VUS || '500');

export const options = {
  scenarios: {
    carga_alta: { executor: 'constant-vus', vus: VUS, duration: __ENV.DURATION || '2m' },
  },
  summaryTrendStats: SUMMARY_STATS,
};

export function setup() { return login(); }

export default function (data) {
  enviarNotificacion(data.token);
  sleep(1);
}

export function teardown() {
  console.log(`>>> CARGA DETENIDA a las ${new Date().toISOString()} (UTC). Desde aquí mide la recuperación en CloudWatch.`);
}

export function handleSummary(data) { return guardarResumen(data, `04-recuperacion-${VUS}vus`); }
