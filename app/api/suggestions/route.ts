import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.MAGDALENA_BACKEND_URL ?? "https://magdalena-backend.vercel.app"

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const upstream = await fetch(`${BACKEND_URL}/api/suggestions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.MAGDALENA_INTERNAL_SECRET
          ? { "x-internal-secret": process.env.MAGDALENA_INTERNAL_SECRET }
          : {}),
      },
      body,
    })
    const data = await upstream.json()
    return NextResponse.json(data)
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
