'use client'

import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { downloadReportExcel } from '@/lib/report-excel'

interface MonthFolder {
  name: string
  pdfCount: number
  csvReady: boolean
  incomePDFCount: number
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
  const topRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/proyeccion/documents')
      .then(r => r.ok ? r.json() : [])
      .then((data: MonthFolder[]) => {
        setMonths(data)
        setSelectedMonths(data.map(m => m.name))
      })
      .catch(() => {})
  }, [])

  // Scroll to top of reports list when a new one is added
  useEffect(() => {
    if (reports.length > 0) {
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', marginTop: '2rem', height: 'calc(100vh - 220px)' }}>

        {/* Panel izquierdo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', minHeight: 0 }}>

          {/* Selector de meses */}
          <div style={{ padding: '1.25rem', border: '1px solid var(--private-border)', borderRadius: '4px', backgroundColor: 'var(--private-glass)' }}>
            <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.75rem' }}>
              Períodos · data/proyeccion/
            </p>

            {months.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem' }}>
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
                        backgroundColor: active ? 'rgba(238,241,81,0.08)' : 'transparent',
                        border: `1px solid ${active ? 'rgba(238,241,81,0.35)' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: '3px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ color: active ? 'var(--private-accent)' : 'rgba(255,255,255,0.5)', fontSize: '0.82rem', fontWeight: active ? 600 : 400 }}>
                          {m.name}
                        </span>
                        <span style={{ color: active ? 'rgba(238,241,81,0.5)' : 'rgba(255,255,255,0.2)', fontSize: '0.7rem' }}>
                          {active ? '✓' : '○'}
                        </span>
                      </div>
                      <div style={{ marginTop: '0.2rem', display: 'flex', gap: '0.6rem' }}>
                        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.7rem' }}>{m.pdfCount} docs</span>
                        {m.csvReady && <span style={{ color: 'rgba(238,241,81,0.4)', fontSize: '0.7rem' }}>CSV ✓</span>}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem' }}>
              <button
                onClick={() => setSelectedMonths(months.map(m => m.name))}
                style={{ flex: 1, padding: '0.4rem', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', cursor: 'pointer' }}
              >
                Todos
              </button>
              <button
                onClick={() => setSelectedMonths([])}
                style={{ flex: 1, padding: '0.4rem', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', cursor: 'pointer' }}
              >
                Ninguno
              </button>
            </div>
          </div>

          {/* Análisis rápidos */}
          <div style={{ padding: '1.25rem', border: '1px solid var(--private-border)', borderRadius: '4px', backgroundColor: 'var(--private-glass)' }}>
            <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.75rem' }}>
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
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '3px',
                      color: disabled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.55)',
                      fontSize: '0.8rem',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={e => {
                      if (!disabled) {
                        e.currentTarget.style.borderColor = 'rgba(238,241,81,0.3)'
                        e.currentTarget.style.color = 'var(--private-accent)'
                      }
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                      e.currentTarget.style.color = disabled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.55)'
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
            <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.75rem' }}>
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
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '3px',
                color: 'rgba(255,255,255,0.88)', fontSize: '0.82rem',
                fontFamily: 'var(--font-body)', lineHeight: 1.5, outline: 'none',
                marginBottom: '0.5rem',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(238,241,81,0.3)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
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

        {/* Panel derecho: historial de informes */}
        <div style={{ overflowY: 'auto', minHeight: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div ref={topRef} />

          {reports.length === 0 ? (
            <div style={{ margin: 'auto', textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.25 }}>◇</div>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem', lineHeight: 1.8 }}>
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
                  overflow: 'hidden',
                }}
              >
                {/* Header del informe */}
                <div style={{
                  padding: '0.9rem 1.25rem',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                    <span style={{ color: 'var(--private-accent)', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'var(--font-heading)', whiteSpace: 'nowrap' }}>
                      {entry.promptLabel}
                    </span>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {entry.months.map(m => (
                        <span key={m} style={{
                          fontSize: '0.65rem', padding: '0.15rem 0.5rem',
                          backgroundColor: 'rgba(238,241,81,0.08)',
                          border: '1px solid rgba(238,241,81,0.2)',
                          borderRadius: '2px', color: 'rgba(238,241,81,0.6)',
                          whiteSpace: 'nowrap',
                        }}>
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                      {entry.timestamp.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {entry.status === 'done' && (
                      <button
                        onClick={() => downloadReportExcel(entry.content, entry.months)}
                        style={{
                          padding: '0.35rem 0.85rem',
                          backgroundColor: 'transparent',
                          border: '1px solid rgba(238,241,81,0.4)',
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
                          e.currentTarget.style.backgroundColor = 'rgba(238,241,81,0.1)'
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                      >
                        ↓ Excel
                      </button>
                    )}
                  </div>
                </div>

                {/* Cuerpo del informe */}
                <div style={{ padding: '1.5rem 1.75rem' }}>
                  {entry.status === 'loading' && (
                    <div style={{ padding: '2rem 0', textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: '0.875rem' }}>
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
                        table: p => <div style={{ overflowX: 'auto', margin: '1rem 0' }}><table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.82rem', border: '1px solid rgba(255,255,255,0.08)' }} {...p} /></div>,
                        thead: p => <thead style={{ backgroundColor: 'rgba(255,255,255,0.03)' }} {...p} />,
                        th: p => <th style={{ padding: '0.6rem 0.8rem', borderBottom: '2px solid rgba(238,241,81,0.3)', borderRight: '1px solid rgba(255,255,255,0.05)', textAlign: 'left', color: 'var(--private-accent)', fontWeight: 600, whiteSpace: 'nowrap' }} {...p} />,
                        td: p => <td style={{ padding: '0.6rem 0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.82)' }} {...p} />,
                        tr: p => <tr style={{ transition: 'background 0.15s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'} {...p} />,
                        code: ({ children, className }) => className
                          ? <pre style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '3px', overflowX: 'auto', fontSize: '0.8rem', margin: '0.5rem 0', border: '1px solid rgba(255,255,255,0.05)' }}><code>{children}</code></pre>
                          : <code style={{ background: 'rgba(238,241,81,0.1)', color: 'var(--private-accent)', padding: '0.1em 0.35em', borderRadius: '2px', fontSize: '0.85em' }}>{children}</code>,
                        p: p => <p style={{ margin: '0 0 0.8rem', color: 'rgba(255,255,255,0.82)', lineHeight: 1.7, fontSize: '0.875rem' }} {...p} />,
                        ul: p => <ul style={{ paddingLeft: '1.25rem', margin: '0.25rem 0 0.8rem', color: 'rgba(255,255,255,0.82)' }} {...p} />,
                        ol: p => <ol style={{ paddingLeft: '1.25rem', margin: '0.25rem 0 0.8rem', color: 'rgba(255,255,255,0.82)' }} {...p} />,
                        li: p => <li style={{ marginBottom: '0.35rem', fontSize: '0.875rem' }} {...p} />,
                        strong: p => <strong style={{ color: 'rgba(255,255,255,0.98)', fontWeight: 700 }} {...p} />,
                        h1: p => <h1 style={{ color: 'var(--private-accent)', fontSize: '1.3rem', margin: '0 0 1rem', fontFamily: 'var(--font-heading)', borderBottom: '1px solid rgba(238,241,81,0.15)', paddingBottom: '0.4rem' }} {...p} />,
                        h2: p => <h2 style={{ color: 'var(--private-accent)', fontSize: '1.1rem', margin: '1.5rem 0 0.75rem', fontFamily: 'var(--font-heading)', borderBottom: '1px solid rgba(238,241,81,0.1)', paddingBottom: '0.3rem' }} {...p} />,
                        h3: p => <h3 style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', margin: '1.25rem 0 0.5rem', fontWeight: 600 }} {...p} />,
                        blockquote: p => <blockquote style={{ borderLeft: '3px solid rgba(238,241,81,0.3)', paddingLeft: '1rem', margin: '0.75rem 0', color: 'rgba(255,255,255,0.55)', fontStyle: 'italic' }} {...p} />,
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
