'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

type JobStatus = 'queued' | 'scraping' | 'analyzing' | 'generating_pdf' | 'complete' | 'error'

interface JobData {
  reportId: string
  clientName: string
  dateFrom: string
  dateTo: string
  selectedNetworks: string[]
  status: JobStatus
  error?: string
  pdfUrl?: string
  createdAt: string
  updatedAt: string
}

const steps: { status: JobStatus; label: string; estimate: string }[] = [
  { status: 'queued', label: 'En cola', estimate: '<1 min' },
  { status: 'scraping', label: 'Recopilando datos', estimate: '5–15 min' },
  { status: 'analyzing', label: 'Analizando con IA', estimate: '1–2 min' },
  { status: 'generating_pdf', label: 'Generando PDF', estimate: '<1 min' },
  { status: 'complete', label: 'Listo', estimate: '' },
]

const statusOrder: Record<JobStatus, number> = {
  queued: 0,
  scraping: 1,
  analyzing: 2,
  generating_pdf: 3,
  complete: 4,
  error: 5,
}

export default function ReportStatusPage() {
  const { reportId } = useParams<{ reportId: string }>()
  const [job, setJob] = useState<JobData | null>(null)
  const [fetchError, setFetchError] = useState('')

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/reports/${reportId}`)
      if (!res.ok) { setFetchError('Reporte no encontrado.'); return }
      const data: JobData = await res.json()
      setJob(data)
    } catch {
      setFetchError('Error al consultar el estado del reporte.')
    }
  }, [reportId])

  useEffect(() => {
    poll()
    const interval = setInterval(() => {
      if (job?.status === 'complete' || job?.status === 'error') return
      poll()
    }, 10_000)
    return () => clearInterval(interval)
  }, [poll, job?.status])

  const currentStepIndex = job ? statusOrder[job.status] : 0

  if (fetchError) {
    return (
      <div className="private-main">
        <p style={{ color: '#ff5050' }}>{fetchError}</p>
        <Link href="/social-listening" style={{ color: 'var(--private-accent)', marginTop: '1rem', display: 'inline-block' }}>← Nuevo reporte</Link>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="private-main">
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Cargando...</div>
      </div>
    )
  }

  return (
    <div className="private-main">
      <div className="private-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="private-title">{job.clientName}</h1>
            <p className="private-subtitle">{job.dateFrom} — {job.dateTo} · {job.selectedNetworks.join(', ')}</p>
          </div>
          <Link href="/social-listening" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textDecoration: 'none' }}>+ Nuevo reporte</Link>
        </div>
      </div>

      {/* Stepper */}
      <div style={{ marginTop: '3rem', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {steps.map((step, i) => {
            const isDone = currentStepIndex > i
            const isCurrent = currentStepIndex === i && job.status !== 'error'
            const isError = job.status === 'error' && i === currentStepIndex - 1

            return (
              <div key={step.status} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: isError ? '#ff5050' : isDone ? 'var(--private-accent)' : isCurrent ? 'rgba(238,241,81,0.3)' : 'rgba(255,255,255,0.1)',
                    border: isCurrent ? '2px solid var(--private-accent)' : isError ? '2px solid #ff5050' : '2px solid transparent',
                    color: isDone ? 'var(--private-bg)' : 'white',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    transition: 'all 0.5s ease',
                  }}>
                    {isError ? '✕' : isDone ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: '0.7rem', marginTop: '0.5rem', color: isCurrent ? 'var(--private-accent)' : isDone ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)', textAlign: 'center', lineHeight: 1.3 }}>
                    {step.label}
                  </span>
                  {isCurrent && step.estimate && (
                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.2rem' }}>{step.estimate}</span>
                  )}
                </div>
                {i < steps.length - 1 && (
                  <div style={{ flex: 1, height: '2px', backgroundColor: isDone ? 'var(--private-accent)' : 'rgba(255,255,255,0.1)', margin: '0 0.5rem', marginBottom: '2rem', transition: 'background-color 0.5s ease' }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Status messages */}
      {job.status === 'scraping' && (
        <div style={{ padding: '1.5rem', backgroundColor: 'rgba(238,241,81,0.05)', border: '1px solid rgba(238,241,81,0.2)', borderRadius: '4px' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
            Apify está recopilando publicaciones de {job.selectedNetworks.join(', ')}. Este proceso toma entre 5 y 15 minutos. La página se actualizará automáticamente.
          </p>
        </div>
      )}

      {job.status === 'analyzing' && (
        <div style={{ padding: '1.5rem', backgroundColor: 'rgba(238,241,81,0.05)', border: '1px solid rgba(238,241,81,0.2)', borderRadius: '4px' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
            Claude está analizando los datos y generando insights para el reporte. Tardará aproximadamente 1-2 minutos.
          </p>
        </div>
      )}

      {job.status === 'error' && (
        <div style={{ padding: '1.5rem', backgroundColor: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: '4px' }}>
          <p style={{ color: '#ff5050', fontWeight: 700, marginBottom: '0.5rem' }}>Error al generar el reporte</p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>{job.error ?? 'Error desconocido. Contacta soporte.'}</p>
        </div>
      )}

      {job.status === 'complete' && job.pdfUrl && (
        <div style={{ padding: '2rem', backgroundColor: 'rgba(238,241,81,0.08)', border: '1px solid rgba(238,241,81,0.4)', borderRadius: '4px' }}>
          <p style={{ color: 'var(--private-accent)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.5rem' }}>
            ✓ Reporte listo
          </p>
          <a
            href={`/api/reports/${reportId}/download`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '1rem 2.5rem',
              backgroundColor: 'var(--private-accent)',
              color: 'var(--private-bg)',
              border: 'none',
              borderRadius: '2px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '0.9rem',
              letterSpacing: '0.1em',
              textDecoration: 'none',
            }}
          >
            DESCARGAR PDF
          </a>
        </div>
      )}

      <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
        ID: {reportId} · Actualizado: {new Date(job.updatedAt).toLocaleTimeString('es-CO')}
      </div>
    </div>
  )
}
