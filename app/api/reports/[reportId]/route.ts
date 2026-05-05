import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

import { loadJob } from '@/lib/blob'

interface Params {
  params: Promise<{ reportId: string }>
}

export async function GET(_request: NextRequest, { params }: Params) {
  const { reportId } = await params
    const job = await loadJob(reportId)
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

    // SI ESTAMOS EN LOCAL O EL WEBHOOK NO LLEGÓ, SINCRONIZAMOS PROACTIVAMENTE
    if (['scraping_posts', 'scraping_comments', 'scraping'].includes(job.status)) {
      const { syncJobWithApify } = await import('./sync')
      const updatedJob = await syncJobWithApify(reportId, job)
      if (updatedJob) return NextResponse.json(updatedJob)
    }

    return NextResponse.json(job)
}
