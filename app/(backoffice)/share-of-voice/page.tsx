'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type SovStatus = 'queued' | 'scraping' | 'analyzing' | 'complete' | 'error'

interface BrandRow {
  name: string
  handleOverride: string
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
  queued:    'En cola',
  scraping:  'Recopilando',
  analyzing: 'Analizando',
  complete:  'Listo',
  error:     'Error',
}

const statusColor: Record<SovStatus, string> = {
  queued:    'var(--private-text-muted)',
  scraping:  'var(--private-text-muted)',
  analyzing: 'var(--private-text-muted)',
  complete:  'var(--private-accent)',
  error:     '#ff5050',
}

const networkGroups = [
  {
    label: 'Redes sociales',
    networks: [
      { id: 'instagram',    label: 'Instagram',     hint: 'Posts y reels por hashtag o cuenta' },
      { id: 'tiktok',       label: 'TikTok',         hint: 'Videos por hashtag o perfil' },
      { id: 'twitter',      label: 'Twitter / X',    hint: 'Tweets por keyword o hashtag' },
      { id: 'facebook',     label: 'Facebook',       hint: 'Posts en páginas públicas' },
      { id: 'youtube',      label: 'YouTube',        hint: 'Videos por término de búsqueda' },
      { id: 'linkedin',     label: 'LinkedIn',       hint: 'Posts de páginas de empresa' },
      { id: 'reddit',       label: 'Reddit',         hint: 'Posts y comentarios por búsqueda' },
    ],
  },
  {
    label: 'Búsquedas y publicidad',
    networks: [
      { id: 'google_search', label: 'Google Search', hint: 'Resultados orgánicos para keywords' },
      { id: 'google_maps',   label: 'Google Maps',   hint: 'Presencia en mapas y reseñas' },
      { id: 'facebook_ads',  label: 'Facebook Ads',  hint: 'Anuncios activos en Meta Ads Library' },
    ],
  },
]

// Costo estimado en USD por scraper (200 resultados max).
// Basado en precios típicos de Apify Compute Units.
const NETWORK_COST_USD: Record<string, number> = {
  instagram:    0.50,
  tiktok:       0.80,
  twitter:      0.40,
  facebook:     0.50,
  youtube:      0.30,
  linkedin:     0.60,
  reddit:       0.20,
  google_search: 0.25,
  google_maps:  0.40,
  facebook_ads: 0.30,
}

const MAX_DAYS = 15

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
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

  const dateDiff = (dateFrom && dateTo)
    ? Math.round((new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / 86400000)
    : null

  const entityCount = 1 + competitorRows.filter(c => c.name.trim()).length
  const estimatedRuns = selectedNetworks.length * entityCount
  const estimatedCostUsd = selectedNetworks.reduce((sum, n) => sum + (NETWORK_COST_USD[n] ?? 0.40), 0) * entityCount
  const costWarning = estimatedCostUsd > 5

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientName.trim()) { setError('Ingresa el nombre del cliente.'); return }
    if (!brandRow.name.trim()) { setError('Ingresa el nombre de la marca principal.'); return }
    if (!dateFrom || !dateTo) { setError('Selecciona el rango de fechas.'); return }
    if (dateDiff === null || dateDiff < 0) { setError('La fecha de inicio debe ser anterior a la fecha de fin.'); return }
    if (dateDiff > MAX_DAYS) { setError(`El rango máximo es ${MAX_DAYS} días. Rango actual: ${dateDiff} días.`); return }
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

  const hint: React.CSSProperties = {
    fontSize: '0.75rem', color: 'var(--private-text-muted)', lineHeight: 1.5, marginTop: '0.35rem',
  }

  return (
    <div className="private-main">
      <div className="private-header">
        <h1 className="private-title">Share of Voice</h1>
        <p className="private-subtitle">Compara la presencia digital de marcas en redes sociales</p>
      </div>

      {/* Explicación del análisis */}
      <div style={{
        maxWidth: '680px', marginTop: '1.5rem', padding: '1rem 1.25rem',
        border: '1px solid var(--private-border)', borderRadius: '4px',
        backgroundColor: 'var(--private-card-bg)', fontSize: '0.82rem',
        color: 'var(--private-text-muted)', lineHeight: 1.65,
      }}>
        <p style={{ margin: 0 }}>
          <strong style={{ color: 'var(--private-text)' }}>¿Qué genera este análisis?</strong>{' '}
          Scrapea publicaciones de la marca y sus competidores en la red seleccionada, calcula el{' '}
          <em>Share of Voice</em> (porcentaje de menciones y engagement), y entrega un informe
          comparativo con serie de tiempo, top posts y análisis escrito generado por IA.
        </p>
        <p style={{ margin: '0.6rem 0 0' }}>
          <strong style={{ color: 'var(--private-text)' }}>Consejo:</strong>{' '}
          Elige períodos cortos y una sola red para obtener resultados más precisos
          y conservar créditos de Apify. El análisis tarda entre 3 y 10 minutos según el volumen.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: '680px', marginTop: '2rem' }}>

        {/* ── Sección 1: Identificación ── */}
        <SectionHeader index="1" title="Identificación del análisis" />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={label}>Cliente *</label>
            <input
              className="private-input"
              data-testid="input-client"
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
              data-testid="input-tema"
              value={tema}
              onChange={e => setTema(e.target.value)}
              placeholder="Ej: fútbol, sostenibilidad..."
              style={{ padding: '0.85rem' }}
            />
            <p style={hint}>Palabra clave que contextualiza la búsqueda (opcional)</p>
          </div>
        </div>

        {/* ── Sección 2: Período ── */}
        <SectionHeader index="2" title="Período a analizar" />

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={label}>Desde *</label>
              <input
                type="date"
                className="private-input"
                data-testid="input-date-from"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                style={{ padding: '0.85rem' }}
              />
            </div>
            <div>
              <label style={label}>Hasta *</label>
              <input
                type="date"
                className="private-input"
                data-testid="input-date-to"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                style={{ padding: '0.85rem' }}
              />
            </div>
          </div>

          {/* Indicador de días */}
          {dateDiff !== null && dateDiff >= 0 && (
            <p
              data-testid="date-counter"
              style={{ fontSize: '0.7rem', marginTop: '0.4rem', color: dateDiff > MAX_DAYS ? '#ff5050' : 'var(--private-text-muted)' }}
            >
              {dateDiff} día{dateDiff !== 1 ? 's' : ''} · máximo {MAX_DAYS} días
              {dateDiff > MAX_DAYS && ` — reduce ${dateDiff - MAX_DAYS} día${dateDiff - MAX_DAYS !== 1 ? 's' : ''}`}
            </p>
          )}
          <p style={hint}>
            Períodos cortos dan mejores resultados y gastan menos créditos. Máximo {MAX_DAYS} días.
          </p>
        </div>

        {/* ── Sección 3: Redes sociales ── */}
        <SectionHeader index="3" title="Redes a analizar" />

        <p style={{ ...hint, marginBottom: '0.85rem' }}>
          Selecciona una o más redes. Cada red × entidad lanza un scraper independiente en Apify.
          El estimador de costo se actualiza en tiempo real para que puedas ajustar antes de lanzar.
        </p>

        <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {networkGroups.map(group => (
            <div key={group.label}>
              <p style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--private-text-muted)', marginBottom: '0.5rem', opacity: 0.6 }}>
                {group.label}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {group.networks.map(n => {
                  const active = selectedNetworks.includes(n.id)
                  return (
                    <button
                      key={n.id}
                      type="button"
                      data-testid={`network-${n.id}`}
                      aria-pressed={active}
                      onClick={() => toggleNetwork(n.id)}
                      title={n.hint}
                      style={{
                        padding: '0.45rem 0.9rem',
                        border: `1px solid ${active ? 'var(--private-accent)' : 'var(--private-border)'}`,
                        borderRadius: '4px',
                        backgroundColor: active ? 'rgba(238,241,81,0.06)' : 'transparent',
                        color: active ? 'var(--private-text)' : 'var(--private-text-muted)',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-heading)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        letterSpacing: '0.05em',
                        transition: 'all 0.2s',
                      }}
                    >
                      {n.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Estimador de costo */}
        {selectedNetworks.length > 0 && (
          <div
            data-testid="cost-estimator"
            style={{
              marginBottom: '1.75rem', padding: '0.85rem 1rem',
              border: `1px solid ${costWarning ? 'rgba(255,180,0,0.35)' : 'var(--private-border)'}`,
              borderRadius: '4px',
              backgroundColor: costWarning ? 'rgba(255,180,0,0.05)' : 'var(--private-card-bg)',
              fontSize: '0.78rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ color: 'var(--private-text-muted)' }}>
                <span style={{ color: 'var(--private-text)', fontWeight: 600 }}>{estimatedRuns} scrapers</span>
                {' '}({selectedNetworks.length} red{selectedNetworks.length !== 1 ? 'es' : ''} × {entityCount} entidad{entityCount !== 1 ? 'es' : ''})
              </div>
              <div style={{ color: costWarning ? 'rgba(255,200,80,0.9)' : 'var(--private-text)', fontWeight: 700, fontSize: '0.85rem' }}>
                ~${estimatedCostUsd.toFixed(2)} USD
              </div>
            </div>
            {costWarning && (
              <p style={{ color: 'rgba(255,200,80,0.8)', fontSize: '0.72rem', marginTop: '0.4rem' }}>
                ⚠ Este análisis consumirá créditos considerables. Considera reducir redes o competidores.
              </p>
            )}
            <p style={{ color: 'var(--private-text-muted)', fontSize: '0.68rem', marginTop: '0.35rem', opacity: 0.7 }}>
              Estimado basado en ~200 resultados por scraper. El costo real puede variar.
            </p>
          </div>
        )}

        {/* ── Sección 4: Marcas ── */}
        <SectionHeader index="4" title="Marcas a comparar" />

        <p style={{ ...hint, marginBottom: '0.85rem' }}>
          Ingresa la marca del cliente y sus competidores. El análisis buscará sus cuentas,
          hashtags y keywords en la red seleccionada para calcular participación relativa.
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
                testId={`input-competitor-${i}`}
              />
            </div>
            {competitorRows.length > 1 && (
              <button
                type="button"
                data-testid="btn-remove-competitor"
                onClick={() => setCompetitorRows(prev => prev.filter((_, idx) => idx !== i))}
                style={{ marginTop: '0.4rem', background: 'none', border: 'none', color: 'var(--private-text-muted)', cursor: 'pointer', fontSize: '1rem', padding: '0.75rem 0.5rem', lineHeight: 1 }}
              >
                ✕
              </button>
            )}
          </div>
        ))}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          {competitorRows.length < 5 ? (
            <button
              type="button"
              data-testid="btn-add-competitor"
              onClick={() => setCompetitorRows(prev => [...prev, emptyBrand()])}
              style={{ fontSize: '0.75rem', color: 'var(--private-accent)', background: 'none', border: '1px solid rgba(238,241,81,0.3)', borderRadius: '4px', padding: '0.4rem 1rem', cursor: 'pointer', letterSpacing: '0.05em' }}
            >
              + Agregar competidor
            </button>
          ) : <span />}
          <button
            type="button"
            onClick={() => setShowAdvanced(p => !p)}
            style={{ fontSize: '0.7rem', color: 'var(--private-text-muted)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.05em', textDecoration: 'underline', opacity: 0.6 }}
          >
            {showAdvanced ? 'Ocultar handles' : 'Personalizar handles'}
          </button>
        </div>

        {/* Preview de búsqueda */}
        {(brandRow.name || competitorRows.some(c => c.name)) && (
          <SearchPreview brandRow={brandRow} competitorRows={competitorRows} tema={tema} selectedNetworks={selectedNetworks} />
        )}

        {error && (
          <div
            data-testid="form-error"
            style={{ padding: '0.85rem 1rem', backgroundColor: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.25)', borderRadius: '4px', color: '#ff5050', fontSize: '0.85rem', marginBottom: '1.5rem' }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          data-testid="btn-submit"
          disabled={isSubmitting}
          className="private-button"
          style={{
            width: '100%', padding: '1.1rem',
            backgroundColor: isSubmitting ? 'rgba(238,241,81,0.4)' : 'var(--private-accent)',
            color: 'var(--text-brown)', border: 'none', borderRadius: '2px',
            fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.95rem',
            letterSpacing: '0.2em', cursor: isSubmitting ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s', boxShadow: '0 8px 20px rgba(238,241,81,0.12)',
          }}
        >
          {isSubmitting ? 'INICIANDO ANÁLISIS...' : 'ANALIZAR SHARE OF VOICE'}
        </button>
      </form>

      {/* Recientes */}
      {recentJobs.length > 0 && (
        <div style={{ maxWidth: '680px', marginTop: '3.5rem', paddingTop: '2rem', borderTop: '1px solid var(--private-border)' }}>
          <p style={{ fontSize: '0.65rem', color: 'var(--private-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
            Análisis recientes
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {recentJobs.map(job => (
              <Link
                key={job.sovId}
                href={`/share-of-voice/${job.sovId}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem 1rem', backgroundColor: 'var(--private-card-bg)', border: '1px solid var(--private-border)', borderRadius: '4px', textDecoration: 'none', transition: 'all 0.2s' }}
                onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--private-accent)')}
                onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--private-border)')}
              >
                <div style={{ minWidth: 0 }}>
                  <span style={{ color: 'var(--private-text)', fontSize: '0.9rem', fontWeight: 600 }}>{job.clientName}</span>
                  <span style={{ color: 'var(--private-text-muted)', fontSize: '0.78rem', marginLeft: '0.6rem' }}>
                    {job.brand?.name} vs {job.competitors?.map(c => c.name).join(', ')}
                  </span>
                  <span style={{ color: 'var(--private-text-muted)', fontSize: '0.72rem', marginLeft: '0.5rem', opacity: 0.6 }}>
                    · {job.selectedNetworks?.[0] ?? ''}
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

// ── Sub-componentes ──────────────────────────────────────────────────────────

function SectionHeader({ index, title }: { index: string; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem', marginTop: '0.25rem' }}>
      <span style={{
        fontSize: '0.65rem', fontWeight: 800, fontFamily: 'var(--font-heading)',
        color: 'var(--private-accent)', border: '1px solid rgba(238,241,81,0.4)',
        borderRadius: '2px', padding: '0.1rem 0.4rem', letterSpacing: '0.05em',
      }}>
        {index}
      </span>
      <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--private-text-muted)' }}>
        {title}
      </span>
    </div>
  )
}

function BrandInput({
  row, onChange, isBrand = false, tema, showAdvanced, testId,
}: {
  row: BrandRow
  onChange: (field: keyof BrandRow, value: string) => void
  isBrand?: boolean
  tema: string
  showAdvanced: boolean
  testId?: string
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
      <span style={{
        fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em',
        color: isBrand ? 'var(--private-accent)' : 'var(--private-text-muted)',
        minWidth: '68px', paddingBottom: '0.85rem', whiteSpace: 'nowrap',
      }}>
        {isBrand ? '★ Marca' : 'Competidor'}
      </span>

      <div style={{ flex: 1 }}>
        <input
          className="private-input"
          data-testid={testId ?? (isBrand ? 'input-brand' : undefined)}
          value={row.name}
          onChange={e => onChange('name', e.target.value)}
          placeholder={isBrand ? 'Davivienda' : 'Bancolombia'}
          style={{ padding: '0.75rem', fontSize: '0.95rem' }}
        />
      </div>

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
    }}>
      {children}
    </span>
  )
}

function SearchPreview({
  brandRow, competitorRows, tema, selectedNetworks,
}: {
  brandRow: BrandRow
  competitorRows: BrandRow[]
  tema: string
  selectedNetworks: string[]
}) {
  const all = [brandRow, ...competitorRows].filter(r => r.name.trim())
  if (all.length === 0) return null

  const allNetworks = networkGroups.flatMap(g => g.networks)
  const networkLabels = selectedNetworks
    .map(id => allNetworks.find(n => n.id === id)?.label ?? id)
    .join(', ')

  return (
    <div
      data-testid="search-preview"
      style={{
        padding: '0.85rem 1rem', marginBottom: '1.5rem',
        border: '1px solid var(--private-border)', borderRadius: '4px',
        backgroundColor: 'var(--private-card-bg)', fontSize: '0.75rem',
      }}
    >
      <p style={{ color: 'var(--private-text-muted)', marginBottom: '0.5rem', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Se buscará en{' '}
        <strong data-testid="preview-network-label" style={{ color: 'var(--private-accent)' }}>
          {networkLabels || '—'}
        </strong>:
      </p>
      {all.map((row, i) => {
        const derived = deriveEntity(row, tema)
        return (
          <div key={i} style={{ marginBottom: i < all.length - 1 ? '0.3rem' : 0, color: 'var(--private-text)' }}>
            <span style={{ fontWeight: 600, color: i === 0 ? 'var(--private-accent)' : 'inherit' }}>{derived.name}</span>
            {' → '}
            <span style={{ color: 'var(--private-text-muted)' }}>
              @{derived.accounts[0]} · #{derived.hashtags.join(', #')}
              {derived.keywords.length > 0 && ` · "${derived.keywords.join('", "')}"`}
            </span>
          </div>
        )
      })}
    </div>
  )
}
