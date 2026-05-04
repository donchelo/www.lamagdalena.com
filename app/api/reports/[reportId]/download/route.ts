import { NextRequest, NextResponse } from 'next/server'
import { loadJob } from '@/lib/blob'

interface Params {
  params: Promise<{ reportId: string }>
}

export async function GET(_request: NextRequest, { params }: Params) {
  const { reportId } = await params
  const job = await loadJob(reportId)

  if (!job) return NextResponse.json({ error: 'Report not found' }, { status: 404 })

  // Buscar el archivo real en el almacenamiento
  const { list } = await import('@vercel/blob')
  const { blobs } = await list({ prefix: `reports/${reportId}/report.pdf`, limit: 1 })
  
  if (blobs.length === 0) return NextResponse.json({ error: 'PDF file not found' }, { status: 404 })

  const response = await fetch(blobs[0].url, {
    headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` }
  })

  const pdfBuffer = await response.arrayBuffer()

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Reporte-LaMagdalena-${job.clientName.replace(/\s+/g, '-')}.pdf"`
    }
  })
}
