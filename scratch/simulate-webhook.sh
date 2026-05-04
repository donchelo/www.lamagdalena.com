#!/bin/bash

# 1. Crear un reporte inicial para obtener un ID
echo "--- Iniciando Simulación ---"
RESPONSE=$(curl -s -X POST http://localhost:3000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "Test Simulator",
    "dateFrom": "2026-04-01",
    "dateTo": "2026-04-30",
    "selectedNetworks": ["tiktok"],
    "accounts": ["bancolombiaoficial"]
  }')

REPORT_ID=$(echo $RESPONSE | grep -oP '(?<="reportId":")[^"]+')

if [ -z "$REPORT_ID" ]; then
  echo "Error: No se pudo crear el reporte inicial. Revisa que npm run dev esté activo."
  exit 1
fi

echo "Reporte de prueba creado: $REPORT_ID"

# 2. Simular que el Scraper de Apify terminó y nos manda 2 videos
echo "Simulando llegada de Webhook desde Apify..."

curl -s -X POST "http://localhost:3000/api/reports/$REPORT_ID/apify-webhook" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "ACTOR.RUN.SUCCEEDED",
    "resource": {
      "id": "simulated-run-id",
      "defaultDatasetId": "simulated-dataset-id"
    }
  }'

echo -e "\n--- Simulación Completada ---"
echo "Revisa la consola donde corre 'npm run dev'. Deberías ver logs diciendo:"
echo "[Webhook] TikTok Stage 1 (Profile) finished..."
