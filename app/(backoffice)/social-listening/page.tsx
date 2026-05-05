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
  queued: 'rgba(255,255,255,0.4)',
  scraping: 'rgba(255,255,255,0.4)',
  scraping_posts: 'rgba(255,255,255,0.4)',
  scraping_comments: 'rgba(255,255,255,0.4)',
  analyzing: 'rgba(255,255,255,0.4)',
  generating_pdf: 'rgba(255,255,255,0.4)',
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
    monitoredTerms: [] as string[],
    selectedNetworks: [] as string[],
  })

  const [termInput, setTermInput] = useState('')

  const addTerm = () => {
    const trimmed = termInput.trim()
    if (!trimmed) return
    if (form.monitoredTerms.includes(trimmed)) {
      setTermInput('')
      return
    }
    setForm(prev => ({ ...prev, monitoredTerms: [...prev.monitoredTerms, trimmed] }))
    setTermInput('')
  }

  const removeTerm = (index: number) => {
    setForm(prev => ({ ...prev, monitoredTerms: prev.monitoredTerms.filter((_, i) => i !== index) }))
  }

  const selectNetwork = (id: string) => {
    setForm(prev => ({
      ...prev,
      selectedNetworks: [id],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const finalTerms = [...form.monitoredTerms]
    if (termInput.trim() && !finalTerms.includes(termInput.trim())) {
      finalTerms.push(termInput.trim())
    }

    if (form.selectedNetworks.length === 0) {
      setError('Selecciona al menos una red social.')
      return
    }
    
    if (finalTerms.length === 0) {
      setError('Agrega al menos un término (keyword, hashtag o cuenta) a monitorear.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          // Mantenemos compatibilidad con el backend enviando los términos en los 3 campos por ahora
          // o ajustamos el backend. Por seguridad enviamos todo a 'keywords' y dejamos los otros vacíos
          // si el backend espera los 3.
          keywords: finalTerms.filter(t => !t.startsWith('#') && !t.startsWith('@')),
          hashtags: finalTerms.filter(t => t.startsWith('#')),
          accounts: finalTerms.filter(t => t.startsWith('@')),
          monitoredTerms: finalTerms
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
          <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem', display: 'block' }}>Nombre del Cliente o Marca *</label>
          <input
            type="text"
            required
            value={form.clientName}
            onChange={e => setForm(p => ({ ...p, clientName: e.target.value }))}
            placeholder="Ej: Bancolombia, Avianca, etc."
            style={{ fontSize: '1.1rem', padding: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="form-group">
            <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem', display: 'block' }}>Rango de Análisis (Inicio) *</label>
            <input 
              type="date" 
              required 
              value={form.dateFrom} 
              onChange={e => setForm(p => ({ ...p, dateFrom: e.target.value }))} 
              style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.8rem' }}
            />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem', display: 'block' }}>Rango de Análisis (Fin) *</label>
            <input 
              type="date" 
              required 
              value={form.dateTo} 
              onChange={e => setForm(p => ({ ...p, dateTo: e.target.value }))} 
              style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.8rem' }}
            />
          </div>
        </div>

        <div className="form-group">
          <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem', display: 'block' }}>Términos a monitorear *</label>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>Incluye @cuentas, #hashtags o palabras clave que desees analizar.</p>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="text"
              value={termInput}
              onChange={e => setTermInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTerm() } }}
              placeholder="Escribe y presiona Enter..."
              style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
            <button 
              type="button" 
              onClick={addTerm} 
              style={{ 
                padding: '0.8rem 1.5rem', 
                backgroundColor: 'var(--private-accent)', 
                color: 'var(--private-bg)', 
                border: 'none', 
                borderRadius: '2px', 
                cursor: 'pointer', 
                fontWeight: 700,
                fontSize: '1.2rem'
              }}
            >
              +
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {form.monitoredTerms.map((tag, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', backgroundColor: 'rgba(238,241,81,0.08)', border: '1px solid rgba(238,241,81,0.3)', borderRadius: '2px', fontSize: '0.85rem', color: 'var(--private-accent)' }}>
                {tag}
                <button type="button" onClick={() => removeTerm(i)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, fontSize: '1.1rem', lineHeight: 1, marginLeft: '0.2rem' }}>×</button>
              </span>
            ))}
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '2.5rem' }}>
          <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: '1rem', display: 'block' }}>Seleccionar Plataforma (Solo una) *</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {networks.map(n => (
              <button
                key={n.id}
                type="button"
                onClick={() => selectNetwork(n.id)}
                style={{
                  flex: 1,
                  padding: '1.2rem',
                  border: `1px solid ${form.selectedNetworks.includes(n.id) ? 'var(--private-accent)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '4px',
                  backgroundColor: form.selectedNetworks.includes(n.id) ? 'rgba(238,241,81,0.05)' : 'rgba(255,255,255,0.02)',
                  color: form.selectedNetworks.includes(n.id) ? 'var(--private-accent)' : 'rgba(255,255,255,0.4)',
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
            style={{
              width: '100%',
              padding: '1.2rem',
              backgroundColor: isSubmitting ? 'rgba(238,241,81,0.4)' : 'var(--private-accent)',
              color: 'var(--private-bg)',
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
        <div style={{ maxWidth: '760px', marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Reportes recientes</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recentReports.map(r => (
              <Link
                key={r.reportId}
                href={`/social-listening/${r.reportId}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '4px', textDecoration: 'none', transition: 'border-color 0.2s' }}
                onMouseOver={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)')}
                onMouseOut={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
              >
                <div>
                  <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', fontWeight: 600 }}>{r.clientName}</span>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', marginLeft: '0.75rem' }}>{r.dateFrom} → {r.dateTo}</span>
                  <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem', marginLeft: '0.75rem' }}>{r.selectedNetworks.join(', ')}</span>
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
