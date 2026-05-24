'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type SovStatus = 'queued' | 'scraping' | 'analyzing' | 'complete' | 'error'

interface SovEntityForm {
  name: string
  accounts: string
  hashtags: string
  keywords: string
}

interface RecentSov {
  sovId: string
  clientName: string
  dateFrom: string
  dateTo: string
  selectedNetworks: string[]
  status: SovStatus
  createdAt: string
  brand: { name: string }
  competitors: Array<{ name: string }>
}

const statusLabel: Record<SovStatus, string> = {
  queued: 'En cola',
  scraping: 'Recopilando',
  analyzing: 'Analizando',
  complete: 'Listo',
  error: 'Error',
}

const statusColor: Record<SovStatus, string> = {
  queued: 'var(--private-text-muted)',
  scraping: 'var(--private-text-muted)',
  analyzing: 'var(--private-text-muted)',
  complete: 'var(--private-accent)',
  error: '#ff5050',
}

const networks = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'twitter', label: 'Twitter' },
]

const emptyEntity = (): SovEntityForm => ({
  name: '',
  accounts: '',
  hashtags: '',
  keywords: '',
})

function parseCommaSeparated(value: string): string[] {
  return value
    .split(',')
    .map(s => s.trim().replace(/^@/, ''))
    .filter(Boolean)
}

export default function ShareOfVoicePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [recentJobs, setRecentJobs] = useState<RecentSov[]>([])

  const [clientName, setClientName] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>(['instagram'])
  const [brand, setBrand] = useState<SovEntityForm>(emptyEntity())
  const [competitors, setCompetitors] = useState<SovEntityForm[]>([emptyEntity()])

  useEffect(() => {
    fetch('/api/sov')
      .then(r => r.ok ? r.json() : [])
      .then(setRecentJobs)
      .catch(() => {})
  }, [])

  const toggleNetwork = (id: string) => {
    setSelectedNetworks(prev =>
      prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]
    )
  }

  const updateCompetitor = (index: number, field: keyof SovEntityForm, value: string) => {
    setCompetitors(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c))
  }

  const addCompetitor = () => {
    if (competitors.length < 5) setCompetitors(prev => [...prev, emptyEntity()])
  }

  const removeCompetitor = (index: number) => {
    setCompetitors(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientName.trim()) { setError('Ingresa el nombre del cliente.'); return }
    if (!brand.name.trim()) { setError('Ingresa el nombre de la marca principal.'); return }
    if (!dateFrom || !dateTo) { setError('Selecciona el rango de fechas.'); return }
    if (selectedNetworks.length === 0) { setError('Selecciona al menos una red social.'); return }

    const validCompetitors = competitors.filter(c => c.name.trim())
    if (validCompetitors.length === 0) { setError('Agrega al menos un competidor.'); return }

    setIsSubmitting(true)
    setError('')

    const toEntity = (form: SovEntityForm) => ({
      name: form.name.trim(),
      accounts: parseCommaSeparated(form.accounts),
      hashtags: parseCommaSeparated(form.hashtags),
      keywords: parseCommaSeparated(form.keywords),
    })

    try {
      const res = await fetch('/api/sov', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: clientName.trim(),
          dateFrom,
          dateTo,
          selectedNetworks,
          brand: toEntity(brand),
          competitors: validCompetitors.map(toEntity),
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Error al crear el análisis.')
      }
      const { sovId } = await res.json()
      router.push(`/share-of-voice/${sovId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el análisis.')
      setIsSubmitting(false)
    }
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'var(--private-text-muted)',
    marginBottom: '0.5rem',
    display: 'block',
  }

  const sectionStyle: React.CSSProperties = {
    padding: '1.5rem',
    border: '1px solid var(--private-border)',
    borderRadius: '4px',
    backgroundColor: 'var(--private-card-bg)',
    marginBottom: '1.5rem',
  }

  return (
    <div className="private-main">
      <div className="private-header">
        <h1 className="private-title">Share of Voice</h1>
        <p className="private-subtitle">Mide la cuota de voz de tu cliente frente a la competencia en redes sociales</p>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: '800px', marginTop: '2.5rem' }}>

        {/* Cliente y fechas */}
        <div style={sectionStyle}>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Nombre del Cliente *</label>
            <input
              type="text"
              required
              className="private-input"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              placeholder="Ej: Natura Colombia"
              style={{ fontSize: '1.1rem', padding: '1rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label style={labelStyle}>Fecha Inicio *</label>
              <input
                type="date"
                required
                className="private-input"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                style={{ padding: '0.8rem' }}
              />
            </div>
            <div className="form-group">
              <label style={labelStyle}>Fecha Fin *</label>
              <input
                type="date"
                required
                className="private-input"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                style={{ padding: '0.8rem' }}
              />
            </div>
          </div>
        </div>

        {/* Redes sociales */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Redes Sociales a Monitorear *</label>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {networks.map(n => (
              <button
                key={n.id}
                type="button"
                onClick={() => toggleNetwork(n.id)}
                style={{
                  flex: 1,
                  minWidth: '120px',
                  padding: '1rem',
                  border: `1px solid ${selectedNetworks.includes(n.id) ? 'var(--private-accent)' : 'var(--private-border)'}`,
                  borderRadius: '4px',
                  backgroundColor: selectedNetworks.includes(n.id) ? 'rgba(238,241,81,0.05)' : 'transparent',
                  color: selectedNetworks.includes(n.id) ? 'var(--private-text)' : 'var(--private-text-muted)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  transition: 'all 0.2s ease',
                }}
              >
                {n.label}
              </button>
            ))}
          </div>
        </div>

        {/* Marca principal */}
        <div style={{ ...sectionStyle, borderColor: 'rgba(238,241,81,0.3)' }}>
          <p style={{ ...labelStyle, color: 'var(--private-accent)', marginBottom: '1.25rem' }}>Marca Principal *</p>
          <EntityFormFields entity={brand} onChange={(f, v) => setBrand(prev => ({ ...prev, [f]: v }))} labelStyle={labelStyle} />
        </div>

        {/* Competidores */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <p style={{ ...labelStyle, marginBottom: 0 }}>Competidores (hasta 5) *</p>
            {competitors.length < 5 && (
              <button
                type="button"
                onClick={addCompetitor}
                style={{ fontSize: '0.75rem', color: 'var(--private-accent)', background: 'none', border: '1px solid var(--private-accent)', borderRadius: '2px', padding: '0.3rem 0.8rem', cursor: 'pointer', letterSpacing: '0.05em' }}
              >
                + Agregar
              </button>
            )}
          </div>

          {competitors.map((comp, i) => (
            <div key={i} style={{ ...sectionStyle, position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <p style={{ ...labelStyle, marginBottom: 0 }}>Competidor {i + 1}</p>
                {competitors.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCompetitor(i)}
                    style={{ fontSize: '0.7rem', color: '#ff5050', background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem 0.5rem' }}
                  >
                    ✕ Eliminar
                  </button>
                )}
              </div>
              <EntityFormFields
                entity={comp}
                onChange={(f, v) => updateCompetitor(i, f, v)}
                labelStyle={labelStyle}
              />
            </div>
          ))}
        </div>

        {error && (
          <div style={{ padding: '1rem', backgroundColor: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: '4px', color: '#ff5050', margin: '1.5rem 0' }}>
            {error}
          </div>
        )}

        <div style={{ marginTop: '2.5rem' }}>
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
              boxShadow: '0 10px 20px rgba(238,241,81,0.15)',
            }}
          >
            {isSubmitting ? 'INICIANDO ANÁLISIS...' : 'ANALIZAR SHARE OF VOICE'}
          </button>
        </div>
      </form>

      {/* Análisis recientes */}
      {recentJobs.length > 0 && (
        <div style={{ maxWidth: '800px', marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--private-border)' }}>
          <p style={{ fontSize: '0.65rem', color: 'var(--private-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
            Análisis recientes
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recentJobs.map(job => (
              <Link
                key={job.sovId}
                href={`/share-of-voice/${job.sovId}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1rem', backgroundColor: 'var(--private-card-bg)', border: '1px solid var(--private-border)', borderRadius: '4px', textDecoration: 'none', transition: 'all 0.2s' }}
                onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--private-accent)')}
                onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--private-border)')}
              >
                <div>
                  <span style={{ color: 'var(--private-text)', fontSize: '0.9rem', fontWeight: 600 }}>{job.clientName}</span>
                  <span style={{ color: 'var(--private-text-muted)', fontSize: '0.8rem', marginLeft: '0.75rem' }}>
                    {job.brand?.name} vs {job.competitors?.map(c => c.name).join(', ')}
                  </span>
                  <span style={{ color: 'var(--private-text-muted)', fontSize: '0.75rem', marginLeft: '0.75rem', opacity: 0.6 }}>
                    {job.dateFrom} → {job.dateTo}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: statusColor[job.status], letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  {statusLabel[job.status]}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function EntityFormFields({
  entity,
  onChange,
  labelStyle,
}: {
  entity: SovEntityForm
  onChange: (field: keyof SovEntityForm, value: string) => void
  labelStyle: React.CSSProperties
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label style={labelStyle}>Nombre de la Marca *</label>
        <input
          type="text"
          className="private-input"
          value={entity.name}
          onChange={e => onChange('name', e.target.value)}
          placeholder="Ej: Natura"
          style={{ padding: '0.75rem' }}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={labelStyle}>Cuentas (@usuario)</label>
          <input
            type="text"
            className="private-input"
            value={entity.accounts}
            onChange={e => onChange('accounts', e.target.value)}
            placeholder="natura, naturaCol"
            style={{ padding: '0.75rem', fontSize: '0.85rem' }}
          />
        </div>
        <div>
          <label style={labelStyle}>Hashtags (#tag)</label>
          <input
            type="text"
            className="private-input"
            value={entity.hashtags}
            onChange={e => onChange('hashtags', e.target.value)}
            placeholder="natura, amorynaturaleza"
            style={{ padding: '0.75rem', fontSize: '0.85rem' }}
          />
        </div>
        <div>
          <label style={labelStyle}>Keywords</label>
          <input
            type="text"
            className="private-input"
            value={entity.keywords}
            onChange={e => onChange('keywords', e.target.value)}
            placeholder="natura colombia"
            style={{ padding: '0.75rem', fontSize: '0.85rem' }}
          />
        </div>
      </div>
    </div>
  )
}
