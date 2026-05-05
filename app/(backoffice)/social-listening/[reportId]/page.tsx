'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

type JobStatus = 'queued' | 'scraping' | 'scraping_posts' | 'scraping_comments' | 'analyzing' | 'generating_pdf' | 'complete' | 'error'

interface JobData {
  reportId: string
  clientName: string
  dateFrom: string
  dateTo: string
  selectedNetworks: string[]
  status: JobStatus
  apifyRunIds?: Record<string, string>
  error?: string
  pdfUrl?: string
  createdAt: string
  updatedAt: string
}

const steps: { status: JobStatus[]; label: string; estimate: string }[] = [
  { status: ['queued'], label: 'En cola', estimate: '<1 min' },
  { status: ['scraping', 'scraping_posts', 'scraping_comments'], label: 'Recopilando datos', estimate: '5–15 min' },
  { status: ['analyzing'], label: 'Analizando con IA', estimate: '1–2 min' },
  { status: ['generating_pdf'], label: 'Generando PDF', estimate: '<1 min' },
  { status: ['complete'], label: 'Listo', estimate: '' },
]

const statusOrder: Record<JobStatus, number> = {
  queued: 0,
  scraping: 1,
  scraping_posts: 1,
  scraping_comments: 1,
  analyzing: 2,
  generating_pdf: 3,
  complete: 4,
  error: 5,
}

export default function ReportStatusPage() {
  const { reportId } = useParams<{ reportId: string }>()
  const [job, setJob] = useState<JobData | null>(null)
  const [fetchError, setFetchError] = useState('')
  const [retrying, setRetrying] = useState(false)
  const [lastPolled, setLastPolled] = useState<Date | null>(null)
  const [now, setNow] = useState(() => new Date())
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Tick every second to keep elapsed timers live
  useEffect(() => {
    tickRef.current = setInterval(() => setNow(new Date()), 1000)
    return () => { if (tickRef.current) clearInterval(tickRef.current) }
  }, [])

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/reports/${reportId}`)
      if (!res.ok) { setFetchError('Reporte no encontrado.'); return }
      const data: JobData = await res.json()
      setJob(data)
      setLastPolled(new Date())
    } catch {
      setFetchError('Error al consultar el estado del reporte.')
    }
  }, [reportId])

  const handleRetry = useCallback(async () => {
    setRetrying(true)
    try {
      const res = await fetch(`/api/reports/${reportId}/retry`, { method: 'POST' })
      if (res.ok) {
        await poll()
      }
    } finally {
      setRetrying(false)
    }
  }, [reportId, poll])

  useEffect(() => {
    poll()
    const interval = setInterval(() => {
      if (job?.status === 'complete' || job?.status === 'error') return
      poll()
    }, 5000) // Poll faster for better feedback
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
            const isCurrent = step.status.includes(job.status) && job.status !== 'error'
            const isError = job.status === 'error' && i === currentStepIndex - 1

            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' }}>
                  <div 
                    className={isCurrent ? 'animate-pulse' : ''}
                    style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: isError ? '#ff5050' : isDone ? 'var(--private-accent)' : isCurrent ? 'rgba(238,241,81,0.3)' : 'rgba(255,255,255,0.1)',
                      border: isCurrent ? '2px solid var(--private-accent)' : isError ? '2px solid #ff5050' : '2px solid transparent',
                      color: isDone ? 'var(--private-bg)' : 'white',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      transition: 'all 0.5s ease',
                    }}
                  >
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
      <div style={{ padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}>
        {job.status === 'queued' && (
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Esperando turno en el servidor...</p>
        )}
        
        {job.status === 'scraping_posts' && (
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
            <span style={{ marginRight: '0.5rem' }}>🔍</span> Buscando publicaciones de TikTok y métricas de perfil...
          </p>
        )}

        {job.status === 'scraping_comments' && (
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
            <span style={{ marginRight: '0.5rem' }}>💬</span> Analizando profundidad de comentarios en videos seleccionados...
          </p>
        )}

        {(job.status === 'scraping' || (!['scraping_posts', 'scraping_comments', 'queued', 'analyzing', 'generating_pdf', 'complete', 'error'].includes(job.status))) && (
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
            Recopilando datos de redes sociales. Esto puede tardar varios minutos.
          </p>
        )}

        {job.status === 'analyzing' && (
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
            <span style={{ marginRight: '0.5rem' }}>🧠</span> Claude está analizando los datos y generando insights estratégicos...
          </p>
        )}

        {job.status === 'generating_pdf' && (
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
            <span style={{ marginRight: '0.5rem' }}>📄</span> Construyendo reporte final de 8 páginas...
          </p>
        )}

        {job.status === 'error' && (
          <div>
            <p style={{ color: '#ff5050', fontWeight: 700, marginBottom: '0.5rem' }}>Error detectado</p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '1rem' }}>{job.error ?? 'Error desconocido.'}</p>
            <button
              onClick={handleRetry}
              disabled={retrying}
              style={{
                padding: '0.6rem 1.5rem',
                backgroundColor: retrying ? 'rgba(255,255,255,0.1)' : 'rgba(238,241,81,0.15)',
                color: retrying ? 'rgba(255,255,255,0.3)' : 'var(--private-accent)',
                border: '1px solid',
                borderColor: retrying ? 'rgba(255,255,255,0.1)' : 'rgba(238,241,81,0.3)',
                borderRadius: '4px',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '0.8rem',
                letterSpacing: '0.1em',
                cursor: retrying ? 'not-allowed' : 'pointer',
              }}
            >
              {retrying ? 'REINTENTANDO...' : 'REINTENTAR ANÁLISIS'}
            </button>
          </div>
        )}

        {job.status === 'complete' && (
          <p style={{ color: 'var(--private-accent)', fontWeight: 700 }}>✓ Todo el proceso se completó correctamente.</p>
        )}
      </div>

      {/* Action Area Premium */}
      {job.status === 'complete' && (
        <div style={{ 
          marginTop: '3rem', 
          padding: '3rem', 
          background: 'linear-gradient(135deg, rgba(238,241,81,0.1) 0%, rgba(238,241,81,0.02) 100%)', 
          border: '1px solid rgba(238,241,81,0.3)', 
          borderRadius: '8px', 
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
          <h2 style={{ 
            fontFamily: 'var(--font-heading)', 
            fontSize: '1.5rem', 
            color: 'var(--private-accent)', 
            marginBottom: '0.5rem',
            letterSpacing: '0.05em'
          }}>
            ANÁLISIS ESTRATÉGICO LISTO
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem', fontSize: '0.95rem' }}>
            El reporte de 8 páginas para {job.clientName} ha sido generado con éxito.
          </p>
          <a
            href={`/api/reports/${reportId}/download`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '1.2rem 3.5rem',
              backgroundColor: 'var(--private-accent)',
              color: 'var(--private-bg)',
              border: 'none',
              borderRadius: '4px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '1rem',
              letterSpacing: '0.15em',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 20px rgba(238,241,81,0.2)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 15px 30px rgba(238,241,81,0.3)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 10px 20px rgba(238,241,81,0.2)'
            }}
          >
            DESCARGAR REPORTE (PDF)
          </a>
        </div>
      )}

      {/* Activity Monitor */}
      {(() => {
        const sinceUpdated = Math.floor((now.getTime() - new Date(job.updatedAt).getTime()) / 1000)
        const sincePolled = lastPolled ? Math.floor((now.getTime() - lastPolled.getTime()) / 1000) : null
        const isActive = ['scraping', 'scraping_posts', 'scraping_comments', 'analyzing', 'generating_pdf'].includes(job.status)
        const looksStuck = isActive && sinceUpdated > 300 // 5 min sin cambio del servidor

        return (
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Monitor Técnico</p>

            {/* Indicadores de actividad */}
            {isActive && (
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                {/* Pulso de la UI */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%',
                    backgroundColor: sincePolled !== null && sincePolled < 8 ? '#4ade80' : 'rgba(255,255,255,0.2)',
                    boxShadow: sincePolled !== null && sincePolled < 8 ? '0 0 6px #4ade80' : 'none',
                    transition: 'all 0.5s ease',
                  }} />
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                    UI verificando
                    {sincePolled !== null && (
                      <span style={{ color: 'rgba(255,255,255,0.25)', marginLeft: '0.3rem' }}>
                        · hace {sincePolled < 60 ? `${sincePolled}s` : `${Math.floor(sincePolled / 60)}m`}
                      </span>
                    )}
                  </span>
                </div>

                {/* Último cambio en servidor */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%',
                    backgroundColor: looksStuck ? 'rgba(251,191,36,0.7)' : sinceUpdated < 30 ? '#4ade80' : 'rgba(255,255,255,0.2)',
                  }} />
                  <span style={{ fontSize: '0.75rem', color: looksStuck ? 'rgba(251,191,36,0.8)' : 'rgba(255,255,255,0.4)' }}>
                    Servidor sin cambio
                    <span style={{ marginLeft: '0.3rem' }}>
                      · hace {sinceUpdated < 60 ? `${sinceUpdated}s` : `${Math.floor(sinceUpdated / 60)}m`}
                    </span>
                  </span>
                </div>
              </div>
            )}

            {/* Nota explicativa si lleva mucho tiempo sin cambio */}
            {looksStuck && (
              <p style={{ fontSize: '0.75rem', color: 'rgba(251,191,36,0.6)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                Apify está scrapeando en background — puede pasar hasta 15 min sin actualizar. Esto es normal.
              </p>
            )}

            {/* IDs técnicos */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)' }}>
                <span style={{ color: 'rgba(255,255,255,0.1)' }}>ID:</span> {reportId}
              </div>
              {job.apifyRunIds && Object.entries(job.apifyRunIds).map(([network, id]) => (
                <div key={id} style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.1)' }}>Apify {network}:</span> {id}
                </div>
              ))}
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)' }}>
                <span style={{ color: 'rgba(255,255,255,0.1)' }}>Último webhook:</span> {new Date(job.updatedAt).toLocaleTimeString('es-CO')}
              </div>
            </div>
          </div>
        )
      })()}

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  )
}
