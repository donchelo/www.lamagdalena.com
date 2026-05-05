import { anthropic } from '@ai-sdk/anthropic'
import { generateText, ModelMessage, UserContent } from 'ai'
import { NextResponse } from 'next/server'
import { loadIncomePDFs, loadCostContext, buildSystemPrompt } from '@/lib/proyeccion'

export const maxDuration = 120

export async function POST(req: Request) {
  const { prompt, selectedMonths }: { prompt: string; selectedMonths: string[] } = await req.json()

  const months     = Array.isArray(selectedMonths) ? selectedMonths : []
  const costCSV    = loadCostContext(months)
  const incomePDFs = loadIncomePDFs(months)
  const system     = buildSystemPrompt(months, costCSV, incomePDFs.length)

  const messages: ModelMessage[] = []

  if (incomePDFs.length > 0) {
    const userContent: UserContent = [
      ...incomePDFs.map(f => ({
        type: 'file' as const,
        data: f.data,
        mediaType: 'application/pdf',
        filename: `[${f.month}] ${f.name}`,
      })),
      { type: 'text' as const, text: 'Estos son los documentos de ingresos de La Magdalena para análisis.' },
    ]
    messages.push({ role: 'user', content: userContent })
    messages.push({
      role: 'assistant',
      content: 'Entendido, he revisado los documentos de ingresos adjuntos y los datos de costos estructurados. Estoy listo para el análisis financiero.',
    })
  }

  messages.push({ role: 'user', content: prompt })

  try {
    const result = await generateText({
      model: anthropic('claude-sonnet-4-6'),
      system,
      messages,
    })
    return NextResponse.json({ content: result.text })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error generando informe' },
      { status: 500 }
    )
  }
}
