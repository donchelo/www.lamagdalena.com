import { saveJob, saveRawData, saveAnalysis, savePdf } from '../lib/supabase'
import { renderReportPdf } from '../lib/pdf/render'

async function generateProfessionalMock() {
  const reportId = 'mock-bancolombia-april'
  const now = new Date().toISOString()

  console.log("--- GENERANDO REPORTE MAESTRO DE BANCOLOMBIA (SIMULADO) ---")

  const job = {
    reportId,
    clientName: 'Bancolombia',
    dateFrom: '2026-04-01',
    dateTo: '2026-04-30',
    selectedNetworks: ['TikTok'],
    keywords: ['bancolombia', 'app bancolombia'],
    hashtags: ['#Bancolombia', '#FinanzasPersonales'],
    accounts: ['bancolombiaoficial'],
    status: 'complete' as const,
    createdAt: now,
    updatedAt: now,
  }

  const analysis = {
    executiveSummary: "Bancolombia mantiene un liderazgo sólido en TikTok durante abril de 2026, destacando por su contenido educativo sobre ahorro en temporada vacacional. La comunidad reacciona positivamente a las actualizaciones tecnológicas, aunque persiste la demanda por integraciones de pago móvil.",
    volumeMetrics: {
      totalPosts: 45,
      totalReach: 2150000,
      timeSeries: [
        { date: '2026-04-01', count: 2, reach: 150000 },
        { date: '2026-04-05', count: 5, reach: 450000 },
        { date: '2026-04-10', count: 3, reach: 200000 },
        { date: '2026-04-15', count: 8, reach: 650000 },
        { date: '2026-04-20', count: 4, reach: 300000 },
        { date: '2026-04-25', count: 6, reach: 400000 },
      ],
      volumeByNetwork: {
        'TikTok': 45
      }
    },
    engagementMetrics: {
      avgEngagementRate: 0.068,
      topPosts: [
        {
          url: 'https://www.tiktok.com/@bancolombiaoficial/video/1',
          platform: 'TikTok',
          likes: 85000,
          comments: 1200,
          caption: '¿Cómo ahorrar en esta Semana Santa? 🌴'
        },
        {
          url: 'https://www.tiktok.com/@bancolombiaoficial/video/2',
          platform: 'TikTok',
          likes: 42000,
          comments: 3500,
          caption: '¡Nueva actualización de la App! 📱✨'
        }
      ]
    },
    sentimentAnalysis: {
      positivePercent: 65,
      neutralPercent: 20,
      negativePercent: 15,
      dominantTopics: ["App Update", "Ahorro Semana Santa", "Servicio al Cliente"],
      sentimentDrivers: {
        positive: ["Facilidad de uso de la App", "Rapidez en transferencias", "Contenido educativo útil"],
        negative: ["Interrupciones programadas", "Dudas sobre Apple Pay", "Tiempos en sucursal física"]
      }
    },
    keyInsights: [
      "El contenido vacacional genera un 40% más de shares que el corporativo.",
      "La audiencia joven valora positivamente las mejoras en la UX de la App.",
      "Existe un interés creciente en inversiones de bajo riesgo (CDT)."
    ],
    recommendations: [
      "Duplicar contenido de tips financieros rápidos tipo 'Lifehacks'.",
      "Implementar campaña de respuesta rápida en comentarios técnicos.",
      "Crear contenido colaborativo con influencers de finanzas personales."
    ]
  }

  console.log("1. Guardando datos en el 'Cerebro' (Supabase)...")
  await saveJob(job)
  await saveRawData(reportId, [])

  console.log("2. Renderizando PDF de 8 páginas...")
  // @ts-expect-error el mock no cumple el tipo completo de analysis; es un borrador, no código de la app
  const pdfBuffer = await renderReportPdf({ job, analysis })
  const pdfUrl = await savePdf(reportId, pdfBuffer)

  console.log("\n--- REPORTE FINAL GENERADO ---")
  console.log(`URL Local: http://localhost:3000/social-listening/${reportId}`)
}

generateProfessionalMock().catch(console.error)
