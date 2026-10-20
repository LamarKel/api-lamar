"""
Lee los resultados de k6 (results/*.json) y genera:
  - results/resumen.csv   -> tabla para el informe
  - charts/*.png          -> gráficas de rendimiento
Uso:  pip install matplotlib   y luego   python make_charts.py
"""
import csv, glob, json, os, re
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

os.makedirs("charts", exist_ok=True)
filas = []
for f in sorted(glob.glob("results/*.json")):
    d = json.load(open(f, encoding="utf-8"))["metrics"]
    dur = d["http_req_duration"]["values"]
    val = lambda m, k, default=0: d.get(m, {}).get("values", {}).get(k, default)
    nombre = os.path.basename(f)[:-5]
    m = re.search(r"(\d+)vus", nombre)
    filas.append({
        "escenario": nombre,
        "vus_max": int(val("vus_max", "max", 0)) or (int(m.group(1)) if m else 0),
        "requests_total": int(val("http_reqs", "count")),
        "throughput_rps": round(val("http_reqs", "rate"), 2),
        "lat_prom_ms": round(dur["avg"], 1),
        "lat_min_ms": round(dur["min"], 1),
        "lat_max_ms": round(dur["max"], 1),
        "p95_ms": round(dur["p(95)"], 1),
        "p99_ms": round(dur["p(99)"], 1),
        "errores_pct": round(val("http_req_failed", "rate") * 100, 2),
        "resp_429": int(val("respuestas_429_throttling", "count")),
        "resp_5xx": int(val("respuestas_5xx", "count")),
    })

with open("results/resumen.csv", "w", newline="", encoding="utf-8") as out:
    w = csv.DictWriter(out, fieldnames=list(filas[0].keys()))
    w.writeheader(); w.writerows(filas)
print("results/resumen.csv generado")
for r in filas: print(r)

# Solo línea base + incremento progresivo, ordenados por usuarios
prog = sorted([r for r in filas if r["escenario"].startswith(("01", "02"))], key=lambda r: r["vus_max"])
x = [r["vus_max"] for r in prog]

def grafica(nombre, titulo, ylabel, series):
    plt.figure(figsize=(8, 4.5))
    for etiqueta, clave in series:
        plt.plot(x, [r[clave] for r in prog], marker="o", label=etiqueta)
    plt.title(titulo); plt.xlabel("Usuarios virtuales"); plt.ylabel(ylabel)
    plt.grid(alpha=.3); plt.legend(); plt.tight_layout()
    plt.savefig(f"charts/{nombre}.png", dpi=150); plt.close()

if prog:
    grafica("latencia", "Latencia vs usuarios", "ms",
            [("Promedio", "lat_prom_ms"), ("P95", "p95_ms"), ("P99", "p99_ms")])
    grafica("throughput", "Throughput vs usuarios", "requests/seg", [("Throughput", "throughput_rps")])
    grafica("errores", "Tasa de errores vs usuarios", "% errores", [("Errores", "errores_pct")])
    print("Gráficas en charts/")
