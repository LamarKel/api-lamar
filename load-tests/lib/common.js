// Configuración y funciones compartidas por todos los escenarios
import http from 'k6/http';
import { check } from 'k6';
import { Counter } from 'k6/metrics';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

export const BASE_URL = __ENV.BASE_URL || 'https://38wq6d11uk.execute-api.us-east-2.amazonaws.com';

// Body exacto que pide la actividad
export const BODY = JSON.stringify({
  email: 'test@test.com',
  subject: 'Prueba',
  message: 'Mensaje de carga',
});

// Contadores por tipo de error para identificar el cuello de botella
export const throttled429 = new Counter('respuestas_429_throttling');
export const errores5xx   = new Counter('respuestas_5xx');
export const timeouts     = new Counter('timeouts');

// Estadísticas que se muestran en el resumen (incluye P95 y P99)
export const SUMMARY_STATS = ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'];

// setup(): hace login una sola vez y comparte el JWT con todos los usuarios virtuales.
// También "despierta" la Lambda para que el cold start no afecte la medición.
export function login() {
  if (!__ENV.EMAIL || !__ENV.PASSWORD) throw new Error('Falta -e EMAIL=... -e PASSWORD=...');
  const res = http.post(`${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: __ENV.EMAIL, password: __ENV.PASSWORD }),
    { headers: { 'Content-Type': 'application/json' }, timeout: '60s' });
  if (res.status !== 200) throw new Error(`Login falló con status ${res.status}: ${res.body}`);
  return { token: res.json('token') };
}

// Una petición POST /notifications/send
export function enviarNotificacion(token) {
  const res = http.post(`${BASE_URL}/notifications/send`, BODY, {
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    timeout: '30s',
    tags: { endpoint: 'notifications_send' },
  });

  if (res.status === 429) throttled429.add(1);
  else if (res.status >= 500) errores5xx.add(1);
  else if (res.status === 0) timeouts.add(1);

  check(res, { 'status 2xx (publicado en SNS)': (r) => r.status === 200 || r.status === 202 });
  return res;
}

// Guarda el resultado en results/<NOMBRE>.json y lo muestra en consola
export function guardarResumen(data, nombre) {
  return {
    [`results/${nombre}.json`]: JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
