'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type SovStatus = 'queued' | 'scraping' | 'analyzing' | 'complete' | 'error'

interface BrandRow {
  name: string
  handleOverride: string  // optional — if blank, derived from name
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

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')  // remove accents
    .replace(/[^a-z0-9]/g, '')
    .trim()
}

function deriveEntity(row: BrandRow, tema: string) {
  const handle = row.handleOverride.trim() || slugify(row.name)
  const slug = slugify(row.name)
  const temaSlug = slugify(tema)
  return {
    name: row.name.trim(),
    accounts: [handle],
    hashtags: [slug, ...(temaSlug ? [temaSlug] : [])],
    keywords: [row.name.trim(), ...(tema.trim() ? [tema.trim()] : [])],
  }
}

const emptyBrand = (): BrandRow => ({ name: '', handleOverride: '' })

export default function ShareOfVoicePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [recentJobs, setRecentJobs] = useState<RecentSov[]>([])

  const [clientName, setClientName] = useState('')
  const [tema, setTema] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>(['instagram'])
  const [brandRow, setBrandRow] = useState<BrandRow>(emptyBrand())
  const [competitorRows, setCompetitorRows] = useState<BrandRow[]>([emptyBrand()])
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    fetch('/api/sov')
      .then(r => r.ok ? r.json() : [])
      .then(setRecentJobs)
      .catch(() => {})
  }, [])

  const toggleNetwork = (id: string) =>
    setSelectedNetworks(prev =>
      prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]
    )

  const updateCompetitor = (i: number, field: keyof BrandRow, value: string) =>
    setCompetitorRows(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientName.trim()) { setError('Ingresa el nombre del cliente.'); return }
    if (!brandRow.name.trim()) { setError('Ingresa el nombre de la marca principal.'); return }
    if (!dateFrom || !dateTo) { setError('Selecciona el rango de fechas.'); return }
    if (selectedNetworks.length === 0) { setError('Selecciona al menos una red social.'); return }

    const validCompetitors = competitorRows.filter(c => c.name.trim())
    if (validCompetitors.length === 0) { setError('Agrega al menos un competidor.'); return }

    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/sov', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: clientName.trim(),
          dateFrom,
          dateTo,
          selectedNetworks,
          brand: deriveEntity(brandRow, tema),
          competitors: validCompetitors.map(c => deriveEntity(c, tema)),
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

  const label: React.CSSProperties = {
    fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em',
    color: 'var(--private-text-muted)', marginBottom: '0.4rem', display: 'block',
  }

  return (
    <div className="private-main">
      <div className="private-header">
        <h1 className="private-title">Share of Voice</h1>
        <p className="private-subtitle">Compara la presencia de marcas en redes sociales</p>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: '680px', marginTop: '2.5rem' }}>

        {/* Fila 1: cliente + tema */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={label}>Cliente *</label>
            <input
              className="private-input"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              placeholder="Ej: Bancolombia"
              style={{ padding: '0.85rem' }}
            />
          </div>
          <div>
            <label style={label}>Tema central</label>
            <input
              className="private-input"
              value={tema}
              onChange={e => setTema(e.target.value)}
              placeholder="Ej: fútbol, sostenibilidad..."
              style={{ padding: '0.85rem' }}
            />
          </div>
        </div>

        {/* Fila 2: fechas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={label}>Desde *</label>
            <input type="date" className="private-input" value={dateFrom}
              onChange={e => setDateFrom(e.target.value)} style={{ padding: '0.85rem' }} />
          </div>
          <div>
            <label style={label}>Hasta *</label>
            <input type="date" className="private-input" value={dateTo}
              onChange={e => setDateTo(e.target.value)} style={{ padding: '0.85rem' }} />
          </div>
        </div>

        {/* Redes */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem' }}>
          {networks.map(n => (
            <button key={n.id} type="button" onClick={() => toggleNetwork(n.id)}
              style={{
                flex: 1, padding: '0.75rem',
                border: `1px solid ${selectedNetworks.includes(n.id) ? 'var(--private-accent)' : 'var(--private-border)'}`,
                borderRadius: '4px',
                backgroundColor: selectedNetworks.includes(n.id) ? 'rgba(238,241,81,0.06)' : 'transparent',
                color: selectedNetworks.includes(n.id) ? 'var(--private-text)' : 'var(--private-text-muted)',
                cursor: 'pointer', fontFamily: 'var(--font-heading)', fontSize: '0.8rem', fontWeight: 600,
                letterSpacing: '0.05em', transition: 'all 0.2s',
              }}>{n.label}</button>
          ))}
        </div>

        {/* Divisor marcas */}
        <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--private-text-muted)', marginBottom: '0.75rem' }}>
          Marcas a comparar
        </p>

        {/* Marca principal */}
        <BrandInput
          row={brandRow}
          onChange={(f, v) => setBrandRow(prev => ({ ...prev, [f]: v }))}
          isBrand
          tema={tema}
          showAdvanced={showAdvanced}
        />

        {/* Competidores */}
        {competitorRows.map((row, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <BrandInput
                row={row}
                onChange={(f, v) => updateCompetitor(i, f, v)}
                tema={tema}
                showAdvanced={showAdvanced}
              />
            </div>
            {competitorRows.length > 1 && (
              <button type="button" onClick={() => setCompetitorRows(prev => prev.filter((_, idx) => idx !== i))}
                style={{ marginTop: '0.4rem', background: 'none', border: 'none', color: 'var(--private-text-muted)', cursor: 'pointer', fontSize: '1rem', padding: '0.75rem 0.5rem', lineHeight: 1 }}>
                ✕
              </button>
            )}
          </div>
        ))}

        {/* Acciones debajo de las marcas */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          {competitorRows.length < 5 ? (
            <button type="button" onClick={() => setCompetitorRows(prev => [...prev, emptyBrand()])}
              style={{ fontSize: '0.75rem', color: 'var(--private-accent)', background: 'none', border: '1px solid rgba(238,241,81,0.3)', borderRadius: '4px', padding: '0.4rem 1rem', cursor: 'pointer', letterSpacing: '0.05em' }}>
              + Agregar competidor
            </button>
          ) : <span />}
          <button type="button" onClick={() => setShowAdvanced(p => !p)}
            style={{ fontSize: '0.7rem', color: 'var(--private-text-muted)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.05em', textDecoration: 'underline', opacity: 0.6 }}>
            {showAdvanced ? 'Ocultar handles' : 'Personalizar handles'}
          </button>
        </div>

        {/* Preview de lo que se va a buscar */}
        {(brandRow.name || competitorRows.some(c => c.name)) && (
          <SearchPreview brandRow={brandRow} competitorRows={competitorRows} tema={tema} />
        )}

        {error && (
          <div style={{ padding: '0.85rem 1rem', backgroundColor: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.25)', borderRadius: '4px', color: '#ff5050', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={isSubmitting} className="private-button"
          style={{
            width: '100%', padding: '1.1rem',
            backgroundColor: isSubmitting ? 'rgba(238,241,81,0.4)' : 'var(--private-accent)',
            color: 'var(--text-brown)', border: 'none', borderRadius: '2px',
            fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.95rem',
            letterSpacing: '0.2em', cursor: isSubmitting ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s', boxShadow: '0 8px 20px rgba(238,241,81,0.12)',
          }}>
          {isSubmitting ? 'INICIANDO ANÁLISIS...' : 'ANALIZAR SHARE OF VOICE'}
        </button>
      </form>

      {/* Recientes */}
      {recentJobs.length > 0 && (
        <div style={{ maxWidth: '680px', marginTop: '3.5rem', paddingTop: '2rem', borderTop: '1px solid var(--private-border)' }}>
          <p style={{ fontSize: '0.65rem', color: 'var(--private-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Análisis recientes</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {recentJobs.map(job => (
              <Link key={job.sovId} href={`/share-of-voice/${job.sovId}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem 1rem', backgroundColor: 'var(--private-card-bg)', border: '1px solid var(--private-border)', borderRadius: '4px', textDecoration: 'none', transition: 'all 0.2s' }}
                onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--private-accent)')}
                onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--private-border)')}>
                <div style={{ minWidth: 0 }}>
                  <span style={{ color: 'var(--private-text)', fontSize: '0.9rem', fontWeight: 600 }}>{job.clientName}</span>
                  <span style={{ color: 'var(--private-text-muted)', fontSize: '0.78rem', marginLeft: '0.6rem' }}>
                    {job.brand?.name} vs {job.competitors?.map(c => c.name).join(', ')}
                  </span>
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: statusColor[job.status], letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
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

function BrandInput({
  row, onChange, isBrand = false, tema, showAdvanced,
}: {
  row: BrandRow
  onChange: (field: keyof BrandRow, value: string) => void
  isBrand?: boolean
  tema: string
  showAdvanced: boolean
}) {
  const derivedHandle = row.handleOverride.trim() || slugify(row.name)
  const temaSlug = slugify(tema)

  return (
    <div style={{
      display: 'flex', gap: '0.75rem', alignItems: 'flex-end',
      marginBottom: '0.6rem',
      padding: isBrand ? '0.75rem 1rem' : '0',
      border: isBrand ? '1px solid rgba(238,241,81,0.25)' : 'none',
      borderRadius: isBrand ? '4px' : '0',
      backgroundColor: isBrand ? 'rgba(238,241,81,0.03)' : 'transparent',
    }}>
      {/* Indicador marca/competidor */}
      <span style={{
        fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em',
        color: isBrand ? 'var(--private-accent)' : 'var(--private-text-muted)',
        minWidth: '68px', paddingBottom: '0.85rem', whiteSpace: 'nowrap',
      }}>
        {isBrand ? '★ Marca' : 'Competidor'}
      </span>

      {/* Nombre */}
      <div style={{ flex: 1 }}>
        <input
          className="private-input"
          value={row.name}
          onChange={e => onChange('name', e.target.value)}
          placeholder={isBrand ? 'Davivienda' : 'Bancolombia'}
          style={{ padding: '0.75rem', fontSize: '0.95rem' }}
        />
      </div>

      {/* Handle override — solo visible en modo avanzado */}
      {showAdvanced && (
        <div style={{ width: '160px' }}>
          <label style={{ fontSize: '0.6rem', color: 'var(--private-text-muted)', display: 'block', marginBottom: '0.35rem' }}>
            @handle {derivedHandle && <span style={{ opacity: 0.5 }}>→ @{derivedHandle}</span>}
          </label>
          <input
            className="private-input"
            value={row.handleOverride}
            onChange={e => onChange('handleOverride', e.target.value)}
            placeholder={`@${slugify(row.name) || 'handle'}`}
            style={{ padding: '0.65rem', fontSize: '0.8rem' }}
          />
        </div>
      )}

      {/* Chips preview */}
      {!showAdvanced && row.name && (
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', alignItems: 'center', paddingBottom: '0.5rem', opacity: 0.6 }}>
          <Chip>@{derivedHandle}</Chip>
          <Chip>#{slugify(row.name)}</Chip>
          {temaSlug && <Chip>#{temaSlug}</Chip>}
        </div>
      )}
    </div>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      fontSize: '0.65rem', padding: '0.15rem 0.4rem',
      border: '1px solid var(--private-border)', borderRadius: '2px',
      color: 'var(--private-text-muted)', whiteSpace: 'nowrap',
    }}>{children}</span>
  )
}

function SearchPreview({
  brandRow, competitorRows, tema,
}: {
  brandRow: BrandRow
  competitorRows: BrandRow[]
  tema: string
}) {
  const all = [brandRow, ...competitorRows].filter(r => r.name.trim())
  if (all.length === 0) return null

  return (
    <div style={{
      padding: '0.85rem 1rem', marginBottom: '1.5rem',
      border: '1px solid var(--private-border)', borderRadius: '4px',
      backgroundColor: 'var(--private-card-bg)', fontSize: '0.75rem',
    }}>
      <p style={{ color: 'var(--private-text-muted)', marginBottom: '0.5rem', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Se buscará en Apify:
      </p>
      {all.map((row, i) => {
        const derived = deriveEntity(row, tema)
        return (
          <div key={i} style={{ marginBottom: i < all.length - 1 ? '0.3rem' : 0, color: 'var(--private-text)' }}>
            <span style={{ fontWeight: 600, color: i === 0 ? 'var(--private-accent)' : 'inherit' }}>{derived.name}</span>
            {' → '}
            <span style={{ color: 'var(--private-text-muted)' }}>
              cuentas: {derived.accounts.join(', ')} · hashtags: #{derived.hashtags.join(', #')}
              {derived.keywords.length > 0 && ` · keywords: ${derived.keywords.join(', ')}`}
            </span>
          </div>
        )
      })}
    </div>
  )
}

