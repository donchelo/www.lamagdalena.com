import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import type { JobData } from '@/lib/blob'
import type { Analysis } from '@/lib/claude'
import { ReportDocument } from './ReportDocument'

interface RenderInput {
  job: JobData
  analysis: Analysis
}

export async function renderReportPdf({ job, analysis }: RenderInput): Promise<Buffer> {
  try {
    // Generar el buffer del PDF usando el componente raíz y los datos proporcionados
    // @ts-ignore - DocumentProps mismatch due to React 19 vs react-pdf types
    const buffer = await renderToBuffer(<ReportDocument job={job} analysis={analysis} />)
    return buffer as Buffer
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack?.split('\n').slice(0, 4).join(' | ') : ''
    console.error('PDF error:', msg, stack)
    throw new Error(`PDF: ${msg}`)
  }
}
