# Pruebas de carga — API Serverless (K6)

Herramienta: **K6**. Endpoint evaluado: `POST /notifications/send`.

| Script | Actividad |
|---|---|
| `01-linea-base.js` | 1 — 10 VUs, 1 min |
| `02-incremento.js` | 2 — 50 / 100 / 250 / 500 VUs, 2 min c/u |
| `03-estres.js` | 4 — 100 → 2000 VUs por escalones, se detiene con >5% errores o P95 > 5 s |
| `04-recuperacion.js` | 5 — carga alta 2 min y corte total |
| `run-all.ps1` | ejecuta actividades 1 y 2 en orden |
| `make_charts.py` | genera `results/resumen.csv` y gráficas en `charts/` |

Cada usuario virtual envía una petición y espera 1 s (`sleep(1)`), simulando un usuario real.
El login se hace una sola vez en `setup()` y el JWT se comparte entre todos los VUs.
