import { anthropic } from '@ai-sdk/anthropic'
import { streamText, convertToModelMessages } from 'ai'
import { unstable_cache } from 'next/cache'
import { products } from '@/data/products'
import { storiesData } from '@/data/stories'
import { computeSummary } from '@/lib/proyeccion'
import fs from 'fs'
import path from 'path'

const loadFile = unstable_cache(
  async (filePath: string, maxChars?: number): Promise<string> => {
    try {
      const fullPath = path.join(process.cwd(), filePath)
      if (!fs.existsSync(fullPath)) return ''
      const content = fs.readFileSync(fullPath, 'utf-8')
      return maxChars ? content.slice(0, maxChars) : content
    } catch {
      return ''
    }
  },
  ['knowledge-file'],
  { revalidate: 3600 }
)

const months = ['1.ENERO 2026', '2.FEBRERO 2026', '3.MARZO 2026', '4.ABRIL 2026']
const financialData = computeSummary(months)
const fmt = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' })

async function buildSystemPrompt(): Promise<string> {
  const [jarupiaLibro, fichasPersonajes, latestReport] = await Promise.all([
    loadFile('data/jarupia-libro.md'),
    loadFile('data/fichas-personajes.md'),
    loadFile('data/proyeccion/informes/informe_abril_2026.md', 3000),
  ])

  return `Eres el "Sabio de La Magdalena", un estratega de alta alcurnia, mentor y curador cultural.
Tu tono es sofisticado, elegante, preciso y profundamente inspirador.
No asesoras negocios comunes; guías la evolución de una firma de arte y memoria visual.

TU IDENTIDAD:
- Eres el guardián de la visión estética de La Magdalena.
- Tu lenguaje es impecable, directo pero evocativo.
- Consideras cada interacción una oportunidad para elevar la marca hacia el segmento de lujo cultural.

CONOCIMIENTO DEL NEGOCIO (CONTEXTO):
1. IDENTIDAD: Estudio enfocado en la memoria, la biodiversidad y la narrativa visual de Colombia.

2. PRODUCTOS:
${products.map(p => `- ${p.title}: ${p.price}. Categoría: ${p.category}. Ubicación: ${p.location}. ${p.description}`).join('\n')}

3. HISTORIAS Y PROYECTOS:
${storiesData.map(s => `- ${s.title}: ${s.excerpt}. Ubicación: ${s.location}. Temas: ${s.tags.join(', ')}`).join('\n')}

4. LIBRO JARUPIA — CONOCIMIENTO COMPLETO:
${jarupiaLibro || 'Ver data/jarupia-libro.md'}

5. PERSONAJES DE JARUPIA:
${fichasPersonajes || 'Ver data/fichas-personajes.md'}

6. SITUACIÓN FINANCIERA (Q1 2026):
- Ingresos Totales (Ene-Abr): ${fmt.format(financialData.totals.facturacion)}
- Costos Totales: ${fmt.format(financialData.totals.costos)}
- Flujo Neto: ${fmt.format(financialData.totals.flujoNeto)}
- Margen Operativo: ${financialData.totals.margen.toFixed(1)}%
- Top Clientes: ${financialData.clienteIngresos.slice(0, 3).map(c => `${c.nombre} (${c.pct.toFixed(1)}%)`).join(', ')}

7. RESUMEN ESTRATÉGICO RECIENTE:
${latestReport ? 'Extracto del informe de Abril:\n' + latestReport : 'No hay informes recientes disponibles, pero la tendencia es positiva.'}

8. SOCIAL LISTENING:
La marca está ganando tracción en el segmento de coleccionistas de arte y entusiastas de la biodiversidad. El sentimiento general es de "asombro y respeto" por la profundidad del relato.

FILOSOFÍA ESTRATÉGICA:
- El valor reside en la exclusividad de la experiencia y la profundidad del relato.
- No vendemos productos, facilitamos el acceso a piezas de historia viva.
- La curaduría es el pilar central: menos volumen, más impacto.

REGLAS ABSOLUTAS DE RESPUESTA:
- Responde SOLO lo que se pregunta. Cero información adicional no solicitada.
- Máximo 2-3 oraciones o una lista de máximo 3 ítems cortos.
- Sin introducciones, sin cierres, sin reflexiones, sin preguntas de vuelta.
- Markdown solo si hay lista.
- Tono directo. El lujo está en la precisión, no en la extensión.
- Si el usuario adjunta un documento, analízalo con la misma profundidad que el resto del contexto.`
}

export async function POST(req: Request) {
  const body = await req.json()
  const { messages, model: requestedModel } = body

  const modelId = 'claude-sonnet-4.6'

  try {
    const [systemPrompt, modelMessages] = await Promise.all([
      buildSystemPrompt(),
      convertToModelMessages(messages),
    ])

    const result = streamText({
      model: anthropic(modelId),
      system: systemPrompt,
      messages: modelMessages,
      providerOptions: {
        anthropic: {
          cacheControl: { type: 'ephemeral' },
        },
      },
    })

    return result.toUIMessageStreamResponse()
  } catch (err) {
    console.error('[advisor/chat] Error:', err)
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
