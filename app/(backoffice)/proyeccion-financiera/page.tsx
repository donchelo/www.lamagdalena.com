'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import ReactMarkdown from 'react-markdown'

interface MonthFolder {
  name: string
  pdfCount: number
  totalSize: number
}

const QUICK_PROMPTS = [
  { label: 'Resumen financiero', text: 'Dame un resumen ejecutivo del estado financiero del período con los números más importantes: ingresos totales, costos totales y flujo de caja neto.' },
  { label: 'Proyectar 3 meses', text: 'Proyecta el flujo de caja para los próximos 3 meses basándote en las tendencias actuales. Muestra los supuestos.' },
  { label: 'Flujo de caja 6m', text: 'Genera una proyección de flujo de caja para los próximos 6 meses con escenario optimista, base y pesimista.' },
  { label: 'Ingresos vs costos', text: 'Desglosa y compara los ingresos (cuentas de cobro, facturas emitidas) vs los costos (facturas de proveedores, seguridad social, nómina) mes a mes.' },
  { label: 'Drivers de costo', text: 'Identifica los 5 mayores drivers de costo y cuáles tienen más potencial de optimización.' },
  { label: 'Punto de equilibrio', text: 'Calcula el punto de equilibrio mensual. ¿Cuánto necesitamos facturar para cubrir todos los costos fijos?' },
]

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ProyeccionFinancieraPage() {
  const [months, setMonths] = useState<MonthFolder[]>([])
  const [selectedMonths, setSelectedMonths] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [inputValue, setInputValue] = useState('')

  // Ref so the transport closure always reads the latest selection
  const selectedMonthsRef = useRef<string[]>([])
  selectedMonthsRef.current = selectedMonths

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/proyeccion/chat',
        body: () => ({ selectedMonths: selectedMonthsRef.current }),
      }),
    []
  )

  const { messages, sendMessage, status } = useChat({ transport })

  useEffect(() => {
    fetch('/api/proyeccion/documents')
      .then(r => r.ok ? r.json() : [])
      .then((data: MonthFolder[]) => {
        setMonths(data)
        setSelectedMonths(data.map(m => m.name))
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || status !== 'ready') return
    sendMessage({ text: trimmed })
    setInputValue('')
  }

  const toggleMonth = (name: string) => {
    setSelectedMonths(prev =>
      prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]
    )
  }

  const totalPDFs = months
    .filter(m => selectedMonths.includes(m.name))
    .reduce((sum, m) => sum + m.pdfCount, 0)

  return (
    <div>
      <div className="private-header">
        <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem', color: 'var(--private-text)', fontFamily: 'var(--font-heading)' }}>Proyección Financiera</h1>
        <p style={{ color: 'var(--private-text-muted)' }}>Analiza tus documentos de ingresos y costos con IA</p>
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
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem', lineHeight: 1.6 }}>
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
                        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.7rem' }}>{m.pdfCount} PDFs</span>
                        <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: '0.7rem' }}>{formatSize(m.totalSize)}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {totalPDFs > 0 && (
              <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', backgroundColor: 'rgba(238,241,81,0.05)', border: '1px solid rgba(238,241,81,0.12)', borderRadius: '3px' }}>
                <span style={{ color: 'rgba(238,241,81,0.7)', fontSize: '0.72rem' }}>
                  {totalPDFs} documentos seleccionados
                </span>
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

          {/* Accesos rápidos */}
          <div style={{ padding: '1.25rem', border: '1px solid var(--private-border)', borderRadius: '4px', backgroundColor: 'var(--private-glass)' }}>
            <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.75rem' }}>
              Análisis rápidos
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {QUICK_PROMPTS.map(p => (
                <button
                  key={p.label}
                  onClick={() => handleSend(p.text)}
                  disabled={status !== 'ready' || selectedMonths.length === 0}
                  style={{
                    padding: '0.55rem 0.75rem',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '3px',
                    color: (status !== 'ready' || selectedMonths.length === 0) ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.55)',
                    fontSize: '0.8rem',
                    cursor: (status !== 'ready' || selectedMonths.length === 0) ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={e => {
                    if (status === 'ready' && selectedMonths.length > 0) {
                      e.currentTarget.style.borderColor = 'rgba(238,241,81,0.3)'
                      e.currentTarget.style.color = 'var(--private-accent)'
                    }
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                    e.currentTarget.style.color = (status !== 'ready' || selectedMonths.length === 0) ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.55)'
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Panel derecho: chat */}
        <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--private-border)', borderRadius: '4px', overflow: 'hidden', backgroundColor: 'var(--private-glass)', minHeight: 0 }}>

          {/* Mensajes */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {messages.length === 0 && (
              <div style={{ margin: 'auto', textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.3 }}>◇</div>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.9rem', lineHeight: 1.8 }}>
                  {months.length === 0
                    ? 'No se encontraron carpetas de meses en data/proyeccion/'
                    : selectedMonths.length === 0
                    ? 'Selecciona al menos un mes para comenzar el análisis.'
                    : `${totalPDFs} documentos listos.\nUsa los accesos rápidos o escribe tu pregunta.`}
                </p>
              </div>
            )}

            {messages.map(msg => (
              <div
                key={msg.id}
                style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '0.85rem 1.1rem',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    lineHeight: 1.7,
                    backgroundColor: msg.role === 'user' ? 'rgba(238,241,81,0.12)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${msg.role === 'user' ? 'rgba(238,241,81,0.25)' : 'rgba(255,255,255,0.08)'}`,
                    color: msg.role === 'user' ? 'var(--private-accent)' : 'rgba(255,255,255,0.88)',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.parts.map((part, i) =>
                    part.type === 'text' ? (
                      msg.role === 'user' ? (
                        <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{part.text}</span>
                      ) : (
                        <ReactMarkdown key={i} components={{
                          table: p => <table style={{ borderCollapse: 'collapse', width: '100%', margin: '0.5rem 0 0.75rem', fontSize: '0.82rem' }} {...p} />,
                          th: p => <th style={{ padding: '0.35rem 0.65rem', borderBottom: '1px solid rgba(238,241,81,0.3)', textAlign: 'left', color: 'var(--private-accent)', fontWeight: 600 }} {...p} />,
                          td: p => <td style={{ padding: '0.35rem 0.65rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }} {...p} />,
                          code: ({ children, className }) => className
                            ? <pre style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '3px', overflowX: 'auto', fontSize: '0.8rem', margin: '0.5rem 0' }}><code>{children}</code></pre>
                            : <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.1em 0.35em', borderRadius: '2px', fontSize: '0.85em' }}>{children}</code>,
                          p: p => <p style={{ margin: '0 0 0.6rem' }} {...p} />,
                          ul: p => <ul style={{ paddingLeft: '1.25rem', margin: '0.25rem 0 0.6rem' }} {...p} />,
                          ol: p => <ol style={{ paddingLeft: '1.25rem', margin: '0.25rem 0 0.6rem' }} {...p} />,
                          li: p => <li style={{ marginBottom: '0.2rem' }} {...p} />,
                          strong: p => <strong style={{ color: 'rgba(255,255,255,0.95)', fontWeight: 600 }} {...p} />,
                          h2: p => <h2 style={{ color: 'var(--private-accent)', fontSize: '1rem', margin: '1rem 0 0.4rem', fontFamily: 'var(--font-heading)' }} {...p} />,
                          h3: p => <h3 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', margin: '0.75rem 0 0.3rem' }} {...p} />,
                        }}>
                          {part.text}
                        </ReactMarkdown>
                      )
                    ) : null
                  )}
                </div>
              </div>
            ))}

            {(status === 'submitted' || status === 'streaming') && (
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <div style={{ padding: '0.85rem 1.1rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>
                  {status === 'submitted' ? 'Cargando documentos' : 'Analizando'}
                  <span style={{ color: 'var(--private-accent)' }}> ···</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--private-border)', display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
            <textarea
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend(inputValue)
                }
              }}
              placeholder={selectedMonths.length === 0 ? 'Selecciona un período para comenzar...' : 'Escribe tu pregunta (Enter para enviar, Shift+Enter nueva línea)'}
              disabled={status !== 'ready' || selectedMonths.length === 0}
              rows={2}
              style={{
                flex: 1, resize: 'none', padding: '0.7rem 0.9rem',
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '3px',
                color: 'rgba(255,255,255,0.88)', fontSize: '0.875rem',
                fontFamily: 'var(--font-body)', lineHeight: 1.5, outline: 'none',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(238,241,81,0.3)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
            />
            <button
              onClick={() => handleSend(inputValue)}
              disabled={status !== 'ready' || !inputValue.trim() || selectedMonths.length === 0}
              style={{
                padding: '0.7rem 1.4rem',
                backgroundColor: (status !== 'ready' || !inputValue.trim() || selectedMonths.length === 0)
                  ? 'rgba(238,241,81,0.3)' : 'var(--private-accent)',
                color: 'var(--private-bg)', border: 'none', borderRadius: '3px',
                fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.85rem',
                cursor: (status !== 'ready' || !inputValue.trim() || selectedMonths.length === 0) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
