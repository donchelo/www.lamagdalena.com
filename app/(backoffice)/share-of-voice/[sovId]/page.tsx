'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  LineChart, Line,
} from 'recharts'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type SovStatus = 'queued' | 'scraping' | 'analyzing' | 'complete' | 'error'

interface SovEntityResult {
  id: string
  name: string
  isBrand: boolean
  postCount: number
  totalEngagement: number
  totalLikes: number
  totalComments: number
  estimatedReach: number
  sovMentions: number
  sovEngagement: number
  byNetwork: Record<string, { postCount: number; engagement: number }>
}

interface SovAnalysis {
  entities: SovEntityResult[]
  totals: { totalPosts: number; totalEngagement: number }
  timeSeries: Array<{ date: string; byEntity: Record<string, number> }>
  insights: string
  topPosts: Array<{ entityId: string; url: string; platform: string; likes: number; comments: number; caption: string }>
}

interface SovJob {
  sovId: string
  status: SovStatus
  clientName: string
  dateFrom: string
  dateTo: string
  selectedNetworks: string[]
  brand: { name: string }
  competitors: Array<{ name: string }>
  apifyRunIds: Record<string, string>
  apifyCompletedRuns: string[]
  totalExpectedRuns: number
  analysis?: SovAnalysis
  generationCostUsd?: number
  error?: string
  createdAt: string
  updatedAt: string
}

const ENTITY_COLORS = [
  'var(--private-accent)',
  '#a78bfa',
  '#34d399',
  '#fb923c',
  '#60a5fa',
  '#f472b6',
]

const statusSteps = [
  { statuses: ['queued'], label: 'En cola' },
  { statuses: ['scraping'], label: 'Recopilando datos' },
  { statuses: ['analyzing'], label: 'Analizando con IA' },
  { statuses: ['complete'], label: 'Completo' },
]

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export default function SovDashboardPage() {
  const { sovId } = useParams<{ sovId: string }>()
  const [job, setJob] = useState<SovJob | null>(null)
  const [fetchError, setFetchError] = useState('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/sov/${sovId}`)
      if (!res.ok) { setFetchError('Análisis no encontrado.'); return }
      const data: SovJob = await res.json()
      setJob(data)
      if (data.status === 'complete' || data.status === 'error') {
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    } catch {
      setFetchError('Error al consultar el estado.')
    }
  }, [sovId])

  useEffect(() => {
    poll()
    intervalRef.current = setInterval(poll, 5000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [poll])

  if (fetchError) {
    return (
      <div className="private-main">
        <p style={{ color: '#ff5050' }}>{fetchError}</p>
        <Link href="/share-of-voice" style={{ color: 'var(--private-text-muted)', fontSize: '0.85rem' }}>← Volver</Link>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="private-main">
        <p style={{ color: 'var(--private-text-muted)' }}>Cargando...</p>
      </div>
    )
  }

  const isProcessing = job.status !== 'complete' && job.status !== 'error'
  const analysis = job.analysis
  const entityColors: Record<string, string> = {}
  analysis?.entities.forEach((e, i) => {
    entityColors[e.id] = ENTITY_COLORS[i % ENTITY_COLORS.length]
  })

  const currentStepIndex = statusSteps.findIndex(s => s.statuses.includes(job.status))

  return (
    <div className="private-main">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link href="/share-of-voice" style={{ fontSize: '0.75rem', color: 'var(--private-text-muted)', textDecoration: 'none', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'block' }}>
            ← Share of Voice
          </Link>
          <h1 className="private-title" style={{ marginBottom: '0.25rem' }}>{job.clientName}</h1>
          <p style={{ color: 'var(--private-text-muted)', fontSize: '0.85rem' }}>
            {job.brand?.name} vs {job.competitors?.map(c => c.name).join(', ')}
            {' · '}
            {job.dateFrom} → {job.dateTo}
            {' · '}
            {job.selectedNetworks.join(', ')}
          </p>
        </div>
        {job.generationCostUsd != null && (
          <span style={{ fontSize: '0.7rem', color: 'var(--private-text-muted)', opacity: 0.6 }}>
            Costo: ${Number(job.generationCostUsd).toFixed(4)} USD
          </span>
        )}
      </div>

      {/* Progress indicator */}
      {isProcessing && (
        <div style={{ padding: '1.5rem', border: '1px solid var(--private-border)', borderRadius: '4px', backgroundColor: 'var(--private-card-bg)', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', gap: '0', marginBottom: '1rem' }}>
            {statusSteps.map((step, i) => {
              const done = i < currentStepIndex || (job.status === 'complete' && i <= currentStepIndex)
              const active = i === currentStepIndex
              return (
                <div key={step.label} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{
                    height: '3px',
                    backgroundColor: done || active ? 'var(--private-accent)' : 'var(--private-border)',
                    marginBottom: '0.6rem',
                    transition: 'background-color 0.4s',
                  }} />
                  <span style={{
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: active ? 'var(--private-accent)' : done ? 'var(--private-text)' : 'var(--private-text-muted)',
                    opacity: active ? 1 : done ? 0.7 : 0.4,
                  }}>{step.label}</span>
                </div>
              )
            })}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--private-text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
            {job.apifyCompletedRuns.length}/{job.totalExpectedRuns} scrapers completados — actualizando cada 5 segundos...
          </p>
        </div>
      )}

      {/* Error state */}
      {job.status === 'error' && (
        <div style={{ padding: '1.5rem', backgroundColor: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: '4px', color: '#ff5050', marginBottom: '2rem' }}>
          <strong>Error:</strong> {job.error ?? 'Ocurrió un error durante el análisis.'}
        </div>
      )}

      {/* Dashboard (only when complete) */}
      {analysis && (
        <>
          {/* Networks with 0 data warning */}
          {(() => {
            const networksWithData = new Set(
              analysis.entities.flatMap(e => Object.keys(e.byNetwork).filter(n => e.byNetwork[n].postCount > 0))
            )
            const emptyNetworks = job.selectedNetworks.filter(n => !networksWithData.has(n))
            if (emptyNetworks.length === 0) return null
            return (
              <div style={{ padding: '0.85rem 1rem', marginBottom: '1.5rem', backgroundColor: 'rgba(255,180,0,0.06)', border: '1px solid rgba(255,180,0,0.25)', borderRadius: '4px', fontSize: '0.8rem', color: 'rgba(255,200,80,0.9)' }}>
                ⚠ Sin datos para: <strong>{emptyNetworks.join(', ')}</strong> — el scraper no retornó resultados (posible bloqueo o sin actividad en el período).
              </div>
            )
          })()}

          {/* KPI cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
            <KpiCard label="Total Posts" value={fmt(analysis.totals.totalPosts)} />
            <KpiCard label="Total Engagement" value={fmt(analysis.totals.totalEngagement)} />
            <KpiCard
              label="SOV Marca"
              value={`${analysis.entities.find(e => e.isBrand)?.sovMentions ?? 0}%`}
              highlight
            />
            <KpiCard
              label="SOV Engagement"
              value={`${analysis.entities.find(e => e.isBrand)?.sovEngagement ?? 0}%`}
              highlight
            />
          </div>

          {/* SOV charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <ChartCard title="Share of Voice — Menciones">
              <SovPieChart
                data={analysis.entities.map(e => ({ name: e.name, value: e.sovMentions }))}
                colors={analysis.entities.map(e => entityColors[e.id])}
              />
            </ChartCard>
            <ChartCard title="Share of Voice — Engagement">
              <SovPieChart
                data={analysis.entities.map(e => ({ name: e.name, value: e.sovEngagement }))}
                colors={analysis.entities.map(e => entityColors[e.id])}
              />
            </ChartCard>
          </div>

          {/* Engagement comparison */}
          <ChartCard title="Comparativa de Métricas" style={{ marginBottom: '2.5rem' }}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analysis.entities} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--private-text-muted)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--private-text-muted)', fontSize: 11 }} tickFormatter={fmt} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--private-card-bg)', border: '1px solid var(--private-border)', borderRadius: '4px' }}
                  formatter={(value) => [fmt(Number(value ?? 0)), '']}
                />
                <Legend wrapperStyle={{ fontSize: '0.75rem', color: 'var(--private-text-muted)' }} />
                <Bar dataKey="postCount" name="Posts" fill={ENTITY_COLORS[0]} radius={[2, 2, 0, 0]} />
                <Bar dataKey="totalLikes" name="Likes" fill={ENTITY_COLORS[1]} radius={[2, 2, 0, 0]} />
                <Bar dataKey="totalComments" name="Comentarios" fill={ENTITY_COLORS[2]} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Time series */}
          {analysis.timeSeries.length > 1 && (
            <ChartCard title="Evolución de Menciones en el Tiempo" style={{ marginBottom: '2.5rem' }}>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart
                  data={analysis.timeSeries}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: 'var(--private-text-muted)', fontSize: 10 }} />
                  <YAxis tick={{ fill: 'var(--private-text-muted)', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--private-card-bg)', border: '1px solid var(--private-border)', borderRadius: '4px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '0.75rem', color: 'var(--private-text-muted)' }} />
                  {analysis.entities.map(entity => (
                    <Line
                      key={entity.id}
                      type="monotone"
                      dataKey={`byEntity.${entity.id}`}
                      name={entity.name}
                      stroke={entityColors[entity.id]}
                      strokeWidth={entity.isBrand ? 2.5 : 1.5}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {/* Comparison table */}
          <div style={{ border: '1px solid var(--private-border)', borderRadius: '4px', overflow: 'hidden', marginBottom: '2.5rem' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--private-border)', backgroundColor: 'var(--private-card-bg)' }}>
              <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--private-text-muted)', margin: 0 }}>Tabla Comparativa</p>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                    {['Entidad', 'Posts', 'Likes', 'Comments', 'Engagement', 'SOV Menciones', 'SOV Engagement'].map(h => (
                      <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--private-text-muted)', fontWeight: 600, borderBottom: '1px solid var(--private-border)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {analysis.entities.map((entity, i) => (
                    <tr key={entity.id} style={{ borderBottom: i < analysis.entities.length - 1 ? '1px solid var(--private-border)' : 'none' }}>
                      <td style={{ padding: '0.85rem 1rem', color: entity.isBrand ? 'var(--private-accent)' : 'var(--private-text)', fontWeight: entity.isBrand ? 700 : 400 }}>
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entityColors[entity.id], marginRight: '0.5rem', verticalAlign: 'middle' }} />
                        {entity.name}
                        {entity.isBrand && <span style={{ fontSize: '0.6rem', marginLeft: '0.4rem', opacity: 0.7 }}>★</span>}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--private-text)' }}>{fmt(entity.postCount)}</td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--private-text)' }}>{fmt(entity.totalLikes)}</td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--private-text)' }}>{fmt(entity.totalComments)}</td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--private-text)' }}>{fmt(entity.totalEngagement)}</td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--private-text)', fontWeight: 600 }}>{entity.sovMentions}%</td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--private-text)', fontWeight: 600 }}>{entity.sovEngagement}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top posts */}
          {analysis.topPosts.length > 0 && (
            <div style={{ marginBottom: '2.5rem' }}>
              <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--private-text-muted)', marginBottom: '1rem' }}>Top Posts por Engagement</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {analysis.topPosts.slice(0, 6).map((post, i) => {
                  const entity = analysis.entities.find(e => e.id === post.entityId)
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem', border: '1px solid var(--private-border)', borderRadius: '4px', backgroundColor: 'var(--private-card-bg)' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--private-text-muted)', minWidth: '20px' }}>#{i + 1}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: entityColors[post.entityId], minWidth: '80px' }}>{entity?.name ?? post.entityId}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--private-text-muted)', minWidth: '60px' }}>{post.platform}</span>
                      <span style={{ flex: 1, fontSize: '0.8rem', color: 'var(--private-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.caption || '—'}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--private-text-muted)', whiteSpace: 'nowrap' }}>❤ {fmt(post.likes)} · 💬 {fmt(post.comments)}</span>
                      {post.url && (
                        <a href={post.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.7rem', color: 'var(--private-accent)', textDecoration: 'none', whiteSpace: 'nowrap' }}>Ver →</a>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* AI Insights */}
          {analysis.insights && (
            <div style={{ border: '1px solid rgba(238,241,81,0.2)', borderRadius: '4px', padding: '2rem', backgroundColor: 'rgba(238,241,81,0.02)' }}>
              <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--private-accent)', marginBottom: '1.5rem' }}>Análisis Estratégico — IA</p>
              <div style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--private-text)' }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{analysis.insights}</ReactMarkdown>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function KpiCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{
      padding: '1.25rem',
      border: `1px solid ${highlight ? 'rgba(238,241,81,0.3)' : 'var(--private-border)'}`,
      borderRadius: '4px',
      backgroundColor: highlight ? 'rgba(238,241,81,0.04)' : 'var(--private-card-bg)',
    }}>
      <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--private-text-muted)', marginBottom: '0.5rem' }}>{label}</p>
      <p style={{ fontSize: '1.6rem', fontFamily: 'var(--font-heading)', color: highlight ? 'var(--private-accent)' : 'var(--private-text)', fontWeight: 700 }}>{value}</p>
    </div>
  )
}

function ChartCard({ title, children, style }: { title: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ border: '1px solid var(--private-border)', borderRadius: '4px', overflow: 'hidden', backgroundColor: 'var(--private-card-bg)', ...style }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--private-border)' }}>
        <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--private-text-muted)', margin: 0 }}>{title}</p>
      </div>
      <div style={{ padding: '1.5rem' }}>
        {children}
      </div>
    </div>
  )
}

function SovPieChart({ data, colors }: { data: Array<{ name: string; value: number }>; colors: string[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={({ name, value }) => `${value}%`}
          labelLine={false}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i] ?? ENTITY_COLORS[i % ENTITY_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [`${value ?? 0}%`, '']}
          contentStyle={{ backgroundColor: 'var(--private-card-bg)', border: '1px solid var(--private-border)', borderRadius: '4px' }}
        />
        <Legend
          wrapperStyle={{ fontSize: '0.75rem', color: 'var(--private-text-muted)' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
