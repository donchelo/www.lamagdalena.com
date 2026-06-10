import { NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"

export async function POST(req: NextRequest) {
  try {
    const { tenantName } = await req.json().catch(() => ({}))
    const today = new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })

    const { text } = await generateText({
      model: anthropic("claude-haiku-4.5"),
      system: `Eres un asesor estratégico de La Magdalena, una empresa colombiana especializada en libros de fotografía y narrativas de biodiversidad y patrimonio cultural. Generás preguntas estratégicas concisas (máximo 10 palabras cada una) para el equipo directivo. Hoy es ${today}.`,
      prompt: `Genera 5 preguntas estratégicas breves y específicas para ${tenantName || "La Magdalena"} en este momento. Devuelve SOLO un JSON con este formato exacto, sin markdown ni explicaciones:\n{"questions":["pregunta 1","pregunta 2","pregunta 3","pregunta 4","pregunta 5"]}`,
      temperature: 1,
    })

    const clean = text.trim().replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim()
    const parsed = JSON.parse(clean) as { questions: string[] }
    const questions = Array.isArray(parsed.questions) ? parsed.questions.slice(0, 5) : fallbackQuestions

    return NextResponse.json({ questions })
  } catch {
    return NextResponse.json({ questions: fallbackQuestions })
  }
}

const fallbackQuestions = [
  "¿Cómo escalar la venta de libros de Jarupia?",
  "¿Qué historia de biodiversidad es la más impactante?",
  "¿Cómo conectar fotos de Armero con nuevos coleccionistas?",
  "¿Cuál es la estrategia de curaduría para la próxima colección?",
  "¿Cómo posicionar La Magdalena en mercados internacionales?",
]
