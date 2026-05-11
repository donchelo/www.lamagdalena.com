'use client'

import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { downloadReportExcel, printReportPDF } from '@/lib/report-excel'
import { type FinancialSummary } from '@/lib/proyeccion'

interface MonthFolder {
  name: string
  /** Docs de egresos en Egresos/FACTURAS/ */
  pdfCount: number
  /** El _consolidado.csv tiene filas de este mes */
  csvReady: boolean
  /** Hay archivo xlsx en Ingresos/ */
  hasIncomeFile: boolean
  /** Hay extracto bancario en Admon/ */
  hasBankStatement: boolean
}

interface ReportEntry {
  id: string
  timestamp: Date
  promptLabel: string
  months: string[]
  content: string
  status: 'loading' | 'done' | 'error'
  errorMessage?: string
}

const QUICK_PROMPTS = [
  { label: 'Resumen financiero', text: 'Dame un resumen ejecutivo del estado financiero del período con los números más importantes: ingresos totales, costos totales y flujo de caja neto.' },
  { label: 'Costos por categoría', text: 'Genera un informe detallado de costos agrupados por categoría de gasto. Para cada categoría muestra: total gastado, % del total de costos, y los proveedores principales. Categorías: Talento humano/Freelancers, Operación (combustible, alimentación, transporte), Tecnología y suscripciones, Almacenamiento y logística, Viajes, Contabilidad, y Otros. Presenta de mayor a menor gasto y explica en qué se está yendo el dinero y qué categorías tienen más potencial de optimización.' },
  { label: 'Proyectar 3 meses', text: 'Proyecta el flujo de caja para los próximos 3 meses basándote en las tendencias actuales. Muestra los supuestos.' },
  { label: 'Flujo de caja 6m', text: 'Genera una proyección de flujo de caja para los próximos 6 meses con escenario optimista, base y pesimista.' },
  { label: 'Ingresos vs costos', text: 'Desglosa y compara los ingresos vs los costos mes a mes con tabla comparativa.' },
  { label: 'Drivers de costo', text: 'Identifica los 5 mayores drivers de costo y cuáles tienen más potencial de optimización.' },
  { label: 'Punto de equilibrio', text: 'Calcula el punto de equilibrio mensual. ¿Cuánto necesitamos facturar para cubrir todos los costos fijos?' },
]

export default function ProyeccionFinancieraPage() {
  const [months, setMonths] = useState<MonthFolder[]>([])
  const [selectedMonths, setSelectedMonths] = useState<string[]>([])
  const [reports, setReports] = useState<ReportEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const [staticReports, setStaticReports] = useState<{id: string, title: string, content: string}[]>([])
  const reportsTopRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/proyeccion/documents')
      .then(r => r.ok ? r.json() : [])
      .then((data: MonthFolder[]) => {
        setMonths(data)
        setSelectedMonths(data.map(m => m.name))
      })
      .catch(() => {})

    fetch('/api/proyeccion/informes')
      .then(r => r.ok ? r.json() : [])
      .then(data => setStaticReports(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (selectedMonths.length === 0) {
      setSummary(null)
      return
    }
    fetch('/api/proyeccion/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ months: selectedMonths }),
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => setSummary(data))
      .catch(() => setSummary(null))
  }, [selectedMonths])

  // Scroll to first report when a new one is added
  useEffect(() => {
    if (reports.length > 0) {
      reportsTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [reports.length])

  const handleSend = async (text: string, label?: string) => {
    const trimmed = text.trim()
    if (!trimmed || isLoading || selectedMonths.length === 0) return

    const id = Date.now().toString()
    const entry: ReportEntry = {
      id,
      timestamp: new Date(),
      promptLabel: label ?? (trimmed.length > 60 ? trimmed.substring(0, 60) + '…' : trimmed),
      months: [...selectedMonths],
      content: '',
      status: 'loading',
    }

    setReports(prev => [entry, ...prev])
    setIsLoading(true)
    setInputValue('')

    try {
      const res = await fetch('/api/proyeccion/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: trimmed, selectedMonths }),
      })
      const data = await res.json()
      setReports(prev => prev.map(r =>
        r.id === id
          ? { ...r, content: data.content ?? '', status: data.error ? 'error' : 'done', errorMessage: data.error }
          : r
      ))
    } catch {
      setReports(prev => prev.map(r =>
        r.id === id ? { ...r, status: 'error', errorMessage: 'Error de red' } : r
      ))
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadStaticReport = (report: {id: string, title: string, content: string}) => {
    const entry: ReportEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      promptLabel: report.title,
      months: ['Reporte Ejecutivo'],
      content: report.content,
      status: 'done',
    }
    setReports(prev => [entry, ...prev])
  }

  const toggleMonth = (name: string) => {
    setSelectedMonths(prev =>
      prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]
    )
  }

  return (
    <div>
      <div className="private-header">
        <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem', color: 'var(--private-text)', fontFamily: 'var(--font-heading)' }}>Proyección Financiera</h1>
        <p style={{ color: 'var(--private-text-muted)' }}>Genera informes financieros con IA · Descarga en Excel</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', marginTop: '2rem', alignItems: 'start' }}>

        {/* Panel izquierdo — sticky so it stays visible while right panel scrolls with the page */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '2rem', maxHeight: 'calc(100vh - 6rem)', overflowY: 'auto' }}>

          {/* Selector de meses */}
          <div style={{ padding: '1.25rem', border: '1px solid var(--private-border)', borderRadius: '4px', backgroundColor: 'var(--private-glass)' }}>
            <p style={{ fontSize: '0.6rem', color: 'var(--private-text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.75rem' }}>
              Períodos · data/proyeccion/
            </p>

            {months.length === 0 ? (
              <p style={{ color: 'var(--private-text-muted)', fontSize: '0.82rem' }}>
                No se encontraron carpetas de meses.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {months.map(m => {
                  const active = selectedMonths.includes(m.name)
                  return (
                    <button
                      key={m.name}
                      onClick={() => toggleMonth(m.name)}
                      style={{
                        padding: '0.65rem 0.85rem',
                        backgroundColor: active ? 'rgba(212,255,0,0.1)' : 'transparent',
                        border: `1px solid ${active ? 'var(--private-accent)' : 'var(--private-border)'}`,
                        borderRadius: '3px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ color: active ? 'var(--private-text)' : 'var(--private-text-muted)', fontSize: '0.82rem', fontWeight: active ? 600 : 400 }}>
                          {m.name}
                        </span>
                        <span style={{ color: active ? 'var(--private-accent)' : 'var(--private-text-muted)', fontSize: '0.7rem' }}>
                          {active ? '✓' : '○'}
                        </span>
                      </div>
                      <div style={{ marginTop: '0.3rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ color: 'var(--private-text-muted)', fontSize: '0.68rem' }}>{m.pdfCount} facturas</span>
                        {m.hasIncomeFile && (
                          <span style={{ color: 'rgba(100,220,130,0.6)', fontSize: '0.68rem' }}>↑ ventas</span>
                        )}
                        {m.hasBankStatement && (
                          <span style={{ color: 'rgba(100,180,255,0.6)', fontSize: '0.68rem' }}>⬤ banco</span>
                        )}
                        {m.csvReady && (
                          <span style={{ color: 'rgba(238,241,81,0.4)', fontSize: '0.68rem' }}>CSV ✓</span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem' }}>
              <button
                onClick={() => setSelectedMonths(months.map(m => m.name))}
                style={{ flex: 1, padding: '0.4rem', backgroundColor: 'transparent', border: '1px solid var(--private-border)', borderRadius: '3px', color: 'var(--private-text-muted)', fontSize: '0.7rem', cursor: 'pointer' }}
              >
                Todos
              </button>
              <button
                onClick={() => setSelectedMonths([])}
                style={{ flex: 1, padding: '0.4rem', backgroundColor: 'transparent', border: '1px solid var(--private-border)', borderRadius: '3px', color: 'var(--private-text-muted)', fontSize: '0.7rem', cursor: 'pointer' }}
              >
                Ninguno
              </button>
            </div>
          </div>

          {/* Informes Especiales (Static) */}
          {staticReports.length > 0 && (
            <div style={{ padding: '1.25rem', border: '1px solid var(--private-accent)', borderRadius: '4px', backgroundColor: 'rgba(238,241,81,0.05)' }}>
              <p style={{ fontSize: '0.6rem', color: 'var(--private-accent)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.75rem', fontWeight: 600 }}>
                Informes Ejecutivos Listos
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {staticReports.map(report => (
                  <button
                    key={report.id}
                    onClick={() => handleLoadStaticReport(report)}
                    style={{
                      padding: '0.6rem 0.75rem',
                      backgroundColor: 'rgba(212,255,0,0.2)',
                      border: '1px solid var(--private-accent)',
                      borderRadius: '3px',
                      color: 'var(--private-text)',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.backgroundColor = 'var(--private-accent)'
                      e.currentTarget.style.color = 'var(--private-bg)'
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.backgroundColor = 'rgba(212,255,0,0.2)'
                      e.currentTarget.style.color = 'var(--private-text)'
                    }}
                  >
                    📄 {report.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Análisis rápidos */}
          <div style={{ padding: '1.25rem', border: '1px solid var(--private-border)', borderRadius: '4px', backgroundColor: 'var(--private-glass)' }}>
            <p style={{ fontSize: '0.6rem', color: 'var(--private-text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.75rem' }}>
              Generar informe
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {QUICK_PROMPTS.map(p => {
                const disabled = isLoading || selectedMonths.length === 0
                return (
                  <button
                    key={p.label}
                    onClick={() => handleSend(p.text, p.label)}
                    disabled={disabled}
                    style={{
                      padding: '0.55rem 0.75rem',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--private-border)',
                      borderRadius: '3px',
                      color: disabled ? 'rgba(92, 74, 51, 0.3)' : 'var(--private-text-muted)',
                      fontSize: '0.8rem',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={e => {
                      if (!disabled) {
                        e.currentTarget.style.borderColor = 'var(--private-accent)'
                        e.currentTarget.style.color = 'var(--private-text)'
                      }
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.borderColor = 'var(--private-border)'
                      e.currentTarget.style.color = disabled ? 'rgba(92, 74, 51, 0.3)' : 'var(--private-text-muted)'
                    }}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Input personalizado */}
          <div style={{ padding: '1.25rem', border: '1px solid var(--private-border)', borderRadius: '4px', backgroundColor: 'var(--private-glass)' }}>
            <p style={{ fontSize: '0.6rem', color: 'var(--private-text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.75rem' }}>
              Análisis personalizado
            </p>
            <textarea
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend(inputValue)
                }
              }}
              placeholder={selectedMonths.length === 0 ? 'Selecciona un período…' : 'Describe el análisis que necesitas…'}
              disabled={isLoading || selectedMonths.length === 0}
              rows={3}
              style={{
                width: '100%', boxSizing: 'border-box', resize: 'none',
                padding: '0.65rem 0.8rem',
                backgroundColor: 'var(--private-card-bg)',
                border: '1px solid var(--private-border)', borderRadius: '3px',
                color: 'var(--private-text)', fontSize: '0.82rem',
                fontFamily: 'var(--font-body)', lineHeight: 1.5, outline: 'none',
                marginBottom: '0.5rem',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--private-accent)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--private-border)' }}
            />
            <button
              onClick={() => handleSend(inputValue)}
              disabled={isLoading || !inputValue.trim() || selectedMonths.length === 0}
              style={{
                width: '100%',
                padding: '0.6rem',
                backgroundColor: (isLoading || !inputValue.trim() || selectedMonths.length === 0)
                  ? 'rgba(238,241,81,0.25)' : 'var(--private-accent)',
                color: 'var(--private-bg)', border: 'none', borderRadius: '3px',
                fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.82rem',
                cursor: (isLoading || !inputValue.trim() || selectedMonths.length === 0) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {isLoading ? 'Generando…' : 'Generar informe'}
            </button>
          </div>
        </div>

        {/* Panel derecho: historial de informes — crece con el contenido, la página hace scroll */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Dashboard Summary Widget */}
          {summary && selectedMonths.length > 0 && (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem',
              backgroundColor: 'var(--private-glass)', padding: '1.5rem',
              borderRadius: '4px', border: '1px solid var(--private-border)',
              marginBottom: '0.5rem'
            }}>
              <div>
                <p style={{ fontSize: '0.65rem', color: 'var(--private-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Facturación</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--private-text)', fontFamily: 'var(--font-heading)' }}>
                  ${(summary.totals.facturacion / 1e6).toFixed(1)}M
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.65rem', color: 'var(--private-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ingresos Neto</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--private-text)', fontFamily: 'var(--font-heading)' }}>
                  ${(summary.totals.ingresos / 1e6).toFixed(1)}M
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.65rem', color: 'var(--private-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Costos</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--private-text)', fontFamily: 'var(--font-heading)' }}>
                  ${(summary.totals.costos / 1e6).toFixed(1)}M
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.65rem', color: 'var(--private-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Flujo Neto</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: summary.totals.flujoNeto >= 0 ? 'rgba(100,220,130,1)' : '#ff6b6b', fontFamily: 'var(--font-heading)' }}>
                  {summary.totals.flujoNeto >= 0 ? '+' : '-'}${(Math.abs(summary.totals.flujoNeto) / 1e6).toFixed(1)}M
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.65rem', color: 'var(--private-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Margen</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--private-text)', fontFamily: 'var(--font-heading)' }}>
                  {summary.totals.margen.toFixed(1)}%
                </p>
              </div>
              {summary.duplicados > 0 && (
                <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem', padding: '0.75rem', backgroundColor: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.2)', borderRadius: '3px', color: '#ff6b6b', fontSize: '0.75rem' }}>
                  ⚠️ <strong>Alerta:</strong> Se detectaron {summary.duplicados} facturas duplicadas en el archivo consolidado. El cálculo anterior ya las ha omitido.
                </div>
              )}

              {/* Breakdown de clientes y costos */}
              <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--private-border)' }}>
                {/* Clientes */}
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--private-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Concentración de Ingresos</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {summary.clienteIngresos.slice(0, 4).map(c => (
                      <div key={c.nombre}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                          <span style={{ color: 'var(--private-text)' }}>{c.nombre}</span>
                          <span style={{ color: 'var(--private-text-muted)' }}>${(c.total / 1e6).toFixed(1)}M ({c.pct.toFixed(1)}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--private-border)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${c.pct}%`, height: '100%', backgroundColor: c.pct > 50 ? '#ffb86c' : 'var(--private-accent)', borderRadius: '2px' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Categorías */}
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--private-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Estructura de Costos</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {summary.costosPorCategoria.slice(0, 4).map(c => (
                      <div key={c.categoria}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                          <span style={{ color: 'var(--private-text)' }}>{c.categoria}</span>
                          <span style={{ color: 'var(--private-text-muted)' }}>${(c.total / 1e6).toFixed(1)}M ({c.pct.toFixed(1)}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--private-border)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${c.pct}%`, height: '100%', backgroundColor: c.pct > 70 ? '#ffb86c' : 'rgba(100,180,255,1)', borderRadius: '2px' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={reportsTopRef} />

          {reports.length === 0 ? (
            <div style={{ margin: 'auto', textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.25 }}>◇</div>
              <p style={{ color: 'var(--private-text-muted)', fontSize: '0.9rem', lineHeight: 1.8 }}>
                {months.length === 0
                  ? 'No se encontraron carpetas de meses en data/proyeccion/'
                  : selectedMonths.length === 0
                  ? 'Selecciona al menos un mes para comenzar.'
                  : 'Selecciona un informe rápido o escribe tu análisis.'}
              </p>
            </div>
          ) : (
            reports.map(entry => (
              <div
                key={entry.id}
                style={{
                  border: '1px solid var(--private-border)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--private-glass)',
                }}
              >
                {/* Header del informe */}
                <div style={{
                  padding: '0.9rem 1.25rem',
                  borderBottom: '1px solid var(--private-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
                  backgroundColor: 'var(--private-card-bg)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                    <span style={{ color: 'var(--private-accent)', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'var(--font-heading)', whiteSpace: 'nowrap' }}>
                      {entry.promptLabel}
                    </span>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {entry.months.map(m => (
                        <span key={m} style={{
                          fontSize: '0.65rem', padding: '0.15rem 0.5rem',
                          backgroundColor: 'rgba(212,255,0,0.1)',
                          border: '1px solid var(--private-accent)',
                          borderRadius: '2px', color: 'var(--private-text)',
                          whiteSpace: 'nowrap',
                        }}>
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    <span style={{ color: 'var(--private-text-muted)', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                      {entry.timestamp.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {entry.status === 'done' && (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => printReportPDF(entry.content, entry.months)}
                          style={{
                            padding: '0.35rem 0.85rem',
                            backgroundColor: 'transparent',
                            border: '1px solid var(--private-border)',
                            borderRadius: '3px',
                            color: 'var(--private-text-muted)',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-heading)',
                            letterSpacing: '0.03em',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s',
                          }}
                          onMouseOver={e => {
                            e.currentTarget.style.backgroundColor = 'var(--private-border)'
                            e.currentTarget.style.color = 'var(--private-text)'
                          }}
                          onMouseOut={e => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                            e.currentTarget.style.color = 'var(--private-text-muted)'
                          }}
                        >
                          ↓ PDF
                        </button>
                        <button
                          onClick={() => downloadReportExcel(entry.content, entry.months)}
                          style={{
                            padding: '0.35rem 0.85rem',
                            backgroundColor: 'transparent',
                            border: '1px solid var(--private-accent)',
                            borderRadius: '3px',
                            color: 'var(--private-accent)',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-heading)',
                            letterSpacing: '0.03em',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s',
                          }}
                          onMouseOver={e => {
                            e.currentTarget.style.backgroundColor = 'rgba(212,255,0,0.2)'
                          }}
                          onMouseOut={e => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }}
                        >
                          ↓ Excel
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cuerpo del informe */}
                <div style={{ padding: '1.5rem 1.75rem' }}>
                  {entry.status === 'loading' && (
                    <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--private-text-muted)', fontSize: '0.875rem' }}>
                      Generando informe
                      <span style={{ color: 'var(--private-accent)' }}> ···</span>
                    </div>
                  )}

                  {entry.status === 'error' && (
                    <div style={{ color: 'rgba(255,100,100,0.8)', fontSize: '0.875rem', padding: '1rem', backgroundColor: 'rgba(255,0,0,0.05)', borderRadius: '3px', border: '1px solid rgba(255,100,100,0.2)' }}>
                      Error: {entry.errorMessage ?? 'No se pudo generar el informe.'}
                    </div>
                  )}

                  {entry.status === 'done' && (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: p => <div style={{ overflowX: 'auto', margin: '1rem 0' }}><table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.82rem', border: '1px solid var(--private-border)' }} {...p} /></div>,
                        thead: p => <thead style={{ backgroundColor: 'var(--private-card-bg)' }} {...p} />,
                        th: p => <th style={{ padding: '0.6rem 0.8rem', borderBottom: '2px solid var(--private-accent)', borderRight: '1px solid var(--private-border)', textAlign: 'left', color: 'var(--private-accent)', fontWeight: 600, whiteSpace: 'nowrap' }} {...p} />,
                        td: p => <td style={{ padding: '0.6rem 0.8rem', borderBottom: '1px solid var(--private-border)', borderRight: '1px solid var(--private-border)', color: 'var(--private-text)' }} {...p} />,
                        tr: p => <tr style={{ transition: 'background 0.15s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--private-border)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'} {...p} />,
                        code: ({ children, className }) => className
                          ? <pre style={{ background: 'var(--private-card-bg)', padding: '0.75rem', borderRadius: '3px', overflowX: 'auto', fontSize: '0.8rem', margin: '0.5rem 0', border: '1px solid var(--private-border)' }}><code>{children}</code></pre>
                          : <code style={{ background: 'rgba(212,255,0,0.15)', color: 'var(--text-brown)', padding: '0.1em 0.35em', borderRadius: '2px', fontSize: '0.85em' }}>{children}</code>,
                        p: p => <p style={{ margin: '0 0 0.8rem', color: 'var(--private-text)', lineHeight: 1.7, fontSize: '0.875rem' }} {...p} />,
                        ul: p => <ul style={{ paddingLeft: '1.25rem', margin: '0.25rem 0 0.8rem', color: 'var(--private-text)' }} {...p} />,
                        ol: p => <ol style={{ paddingLeft: '1.25rem', margin: '0.25rem 0 0.8rem', color: 'var(--private-text)' }} {...p} />,
                        li: p => <li style={{ marginBottom: '0.35rem', fontSize: '0.875rem' }} {...p} />,
                        strong: p => <strong style={{ color: 'var(--private-text)', fontWeight: 700 }} {...p} />,
                        h1: p => <h1 style={{ color: 'var(--private-text)', fontSize: '1.3rem', margin: '0 0 1rem', fontFamily: 'var(--font-heading)', borderBottom: '1px solid var(--private-border)', paddingBottom: '0.4rem' }} {...p} />,
                        h2: p => <h2 style={{ color: 'var(--private-text)', fontSize: '1.1rem', margin: '1.5rem 0 0.75rem', fontFamily: 'var(--font-heading)', borderBottom: '1px solid var(--private-border)', paddingBottom: '0.3rem' }} {...p} />,
                        h3: p => <h3 style={{ color: 'var(--private-text)', fontSize: '0.95rem', margin: '1.25rem 0 0.5rem', fontWeight: 600 }} {...p} />,
                        blockquote: p => <blockquote style={{ borderLeft: '3px solid var(--private-accent)', paddingLeft: '1rem', margin: '0.75rem 0', color: 'var(--private-text-muted)', fontStyle: 'italic' }} {...p} />,
                      }}
                    >
                      {entry.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
