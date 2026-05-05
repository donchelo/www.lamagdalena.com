import { anthropic } from '@ai-sdk/anthropic'
import { convertToModelMessages, streamText, UIMessage } from 'ai'
import { loadIncomePDFs, loadCostContext, buildSystemPrompt } from '@/lib/proyeccion'

export const maxDuration = 120

export async function POST(req: Request) {
  const { messages, selectedMonths }: { messages: UIMessage[]; selectedMonths: string[] } = await req.json()

  const months = Array.isArray(selectedMonths) ? selectedMonths : []
  const costCSV    = loadCostContext(months)
  const incomePDFs = loadIncomePDFs(months)
  const system     = buildSystemPrompt(months, costCSV, incomePDFs.length)

  const modelMessages = await convertToModelMessages(messages)

  if (incomePDFs.length > 0) {
    modelMessages.unshift(
      {
        role: 'user',
        content: [
          ...incomePDFs.map(f => ({
            type: 'file' as const,
            data: f.data,
            mediaType: 'application/pdf' as const,
            filename: `[${f.month}] ${f.name}`,
          })),
          { type: 'text' as const, text: 'Estos son los documentos de ingresos de La Magdalena para análisis.' },
        ],
      },
      {
        role: 'assistant',
        content: 'Entendido, he revisado los documentos de ingresos adjuntos y los datos de costos estructurados. Estoy listo para el análisis financiero.',
      }
    )
  }

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system,
    messages: modelMessages,
  })

  return result.toUIMessageStreamResponse()
}
