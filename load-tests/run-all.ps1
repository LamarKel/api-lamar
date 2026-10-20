# Ejecuta todas las pruebas en orden.
# Uso:  .\run-all.ps1 -Email "kelvin@test.com" -Password "123456"
param(
  [Parameter(Mandatory=$true)][string]$Email,
  [Parameter(Mandatory=$true)][string]$Password,
  [string]$BaseUrl = "https://38wq6d11uk.execute-api.us-east-2.amazonaws.com"
)
$common = @("-e", "EMAIL=$Email", "-e", "PASSWORD=$Password", "-e", "BASE_URL=$BaseUrl")
New-Item -ItemType Directory -Force -Path results | Out-Null

function Pausa($msg) { Write-Host "`n=== $msg ===" -ForegroundColor Cyan; Start-Sleep -Seconds 60 }

Write-Host "`n### ACTIVIDAD 1: Línea base (10 VUs, 1 min)" -ForegroundColor Green
k6 run @common 01-linea-base.js
Pausa "Esperando 1 min para que el sistema se estabilice"

foreach ($v in 50, 100, 250, 500) {
  Write-Host "`n### ACTIVIDAD 2: $v VUs, 2 min" -ForegroundColor Green
  k6 run @common -e VUS=$v -e DURATION=2m 02-incremento.js
  Pausa "Esperando 1 min entre escenarios"
}

Write-Host "`nListo. Ejecuta por separado (mirando CloudWatch):" -ForegroundColor Yellow
Write-Host "  k6 run @common 03-estres.js"
Write-Host "  k6 run @common -e VUS=500 04-recuperacion.js"
