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
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate PDF report')
  }
}
