'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type JobStatus = 'queued' | 'scraping' | 'scraping_posts' | 'scraping_comments' | 'analyzing' | 'generating_pdf' | 'complete' | 'error'

interface RecentReport {
  reportId: string
  clientName: string
  dateFrom: string
  dateTo: string
  selectedNetworks: string[]
  status: JobStatus
  createdAt: string
}

const statusLabel: Record<JobStatus, string> = {
  queued: 'En cola',
  scraping: 'Recopilando',
  scraping_posts: 'Recopilando posts',
  scraping_comments: 'Recopilando comentarios',
  analyzing: 'Analizando',
  generating_pdf: 'Generando PDF',
  complete: 'Listo',
  error: 'Error',
}

const statusColor: Record<JobStatus, string> = {
  queued: 'var(--private-text-muted)',
  scraping: 'var(--private-text-muted)',
  scraping_posts: 'var(--private-text-muted)',
  scraping_comments: 'var(--private-text-muted)',
  analyzing: 'var(--private-text-muted)',
  generating_pdf: 'var(--private-text-muted)',
  complete: 'var(--private-accent)',
  error: '#ff5050',
}

const networks = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
]

export default function SocialListeningPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [recentReports, setRecentReports] = useState<RecentReport[]>([])

  useEffect(() => {
    fetch('/api/reports')
      .then(r => r.ok ? r.json() : [])
      .then(setRecentReports)
      .catch(() => {})
  }, [])

  const [form, setForm] = useState({
    clientName: '',
    dateFrom: '',
    dateTo: '',
    selectedNetworks: [] as string[],
  })



  const selectNetwork = (id: string) => {
    setForm(prev => ({
      ...prev,
      selectedNetworks: [id],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.clientName.trim()) {
      setError('Agrega el nombre de la cuenta a monitorear.')
      return
    }

    if (form.selectedNetworks.length === 0) {
      setError('Selecciona al menos una red social.')
      return
    }

    setIsSubmitting(true)
    setError('')

    const accountName = form.clientName.trim().replace('@', '')

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          keywords: [],
          hashtags: [],
          accounts: [accountName],
          monitoredTerms: [accountName]
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      const { reportId } = await res.json()
      router.push(`/social-listening/${reportId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el reporte.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="private-main">
      <div className="private-header">
        <h1 className="private-title">Nuevo Reporte de Social Listening</h1>
        <p className="private-subtitle">Genera un análisis estratégico a partir de datos de redes sociales</p>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: '760px', marginTop: '2.5rem' }}>
        <div className="form-group">
          <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--private-text-muted)', marginBottom: '0.5rem', display: 'block' }}>Cuenta a Monitorear (Usuario) *</label>
          <input
            type="text"
            required
            className="private-input"
            value={form.clientName}
            onChange={e => setForm(p => ({ ...p, clientName: e.target.value }))}
            placeholder="Ej: vidriomejorplaneta"
            style={{ fontSize: '1.1rem', padding: '1rem' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="form-group">
            <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--private-text-muted)', marginBottom: '0.5rem', display: 'block' }}>Rango de Análisis (Inicio) *</label>
            <input 
              type="date" 
              required 
              className="private-input"
              value={form.dateFrom} 
              onChange={e => setForm(p => ({ ...p, dateFrom: e.target.value }))} 
              style={{ padding: '0.8rem' }}
            />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--private-text-muted)', marginBottom: '0.5rem', display: 'block' }}>Rango de Análisis (Fin) *</label>
            <input 
              type="date" 
              required 
              className="private-input"
              value={form.dateTo} 
              onChange={e => setForm(p => ({ ...p, dateTo: e.target.value }))} 
              style={{ padding: '0.8rem' }}
            />
          </div>
        </div>



        <div className="form-group" style={{ marginTop: '2.5rem' }}>
          <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--private-text-muted)', marginBottom: '1rem', display: 'block' }}>Seleccionar Plataforma (Solo una) *</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {networks.map(n => (
              <button
                key={n.id}
                type="button"
                onClick={() => selectNetwork(n.id)}
                style={{
                  flex: 1,
                  padding: '1.2rem',
                  border: `1px solid ${form.selectedNetworks.includes(n.id) ? 'var(--private-accent)' : 'var(--private-border)'}`,
                  borderRadius: '4px',
                  backgroundColor: form.selectedNetworks.includes(n.id) ? 'rgba(238,241,81,0.05)' : 'var(--private-card-bg)',
                  color: form.selectedNetworks.includes(n.id) ? 'var(--private-text)' : 'var(--private-text-muted)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  transition: 'all 0.2s ease',
                  textAlign: 'center'
                }}
              >
                {n.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ padding: '1rem', backgroundColor: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: '4px', color: '#ff5050', margin: '2rem 0' }}>
            {error}
          </div>
        )}

        <div style={{ marginTop: '3rem' }}>
          <button
            type="submit"
            disabled={isSubmitting}
            className="private-button"
            style={{
              width: '100%',
              padding: '1.2rem',
              backgroundColor: isSubmitting ? 'rgba(238,241,81,0.4)' : 'var(--private-accent)',
              color: 'var(--text-brown)',
              border: 'none',
              borderRadius: '2px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '1rem',
              letterSpacing: '0.2em',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 20px rgba(238,241,81,0.15)'
            }}
          >
            {isSubmitting ? 'PROCESANDO DATOS...' : 'GENERAR ESTRATEGIA NEON'}
          </button>
        </div>
      </form>

      {recentReports.length > 0 && (
        <div style={{ maxWidth: '760px', marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--private-border)' }}>
          <p style={{ fontSize: '0.65rem', color: 'var(--private-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Reportes recientes</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recentReports.map(r => (
              <Link
                key={r.reportId}
                href={`/social-listening/${r.reportId}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1rem', backgroundColor: 'var(--private-card-bg)', border: '1px solid var(--private-border)', borderRadius: '4px', textDecoration: 'none', transition: 'all 0.2s' }}
                onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--private-accent)')}
                onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--private-border)')}
              >
                <div>
                  <span style={{ color: 'var(--private-text)', fontSize: '0.9rem', fontWeight: 600 }}>{r.clientName}</span>
                  <span style={{ color: 'var(--private-text-muted)', fontSize: '0.8rem', marginLeft: '0.75rem' }}>{r.dateFrom} → {r.dateTo}</span>
                  <span style={{ color: 'var(--private-text-muted)', fontSize: '0.75rem', marginLeft: '0.75rem', opacity: 0.6 }}>{r.selectedNetworks.join(', ')}</span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: statusColor[r.status], letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  {statusLabel[r.status]}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
