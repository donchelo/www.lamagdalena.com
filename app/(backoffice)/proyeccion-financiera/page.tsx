"use client"
import { useEffect, useRef, useState, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts'
import { downloadReportExcel, printReportPDF } from '@/lib/report-excel'
import { type FinancialSummary } from '@/lib/proyeccion'

interface MonthFolder {
  name: string
  pdfCount: number
  csvReady: boolean
  hasIncomeFile: boolean
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
  const [isMounted, setIsMounted] = useState(false)
  const reportsTopRef = useRef<HTMLDivElement>(null)

  // Chart Colors (Brand Aligned)
  const COLORS = ['#d4ff00', '#5c4a33', '#8e8e8e', '#c1c1c1', '#e0e0e0']

  useEffect(() => {
    setIsMounted(true)
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

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val)
  }

  const chartData = useMemo(() => {
    if (!summary) return []
    return summary.monthly.map(m => ({
      name: m.name,
      Facturación: m.facturacion,
      Costos: m.costos,
      Neto: m.flujoNeto
    }))
  }, [summary])

  return (
    <div style={{ padding: '1rem 0' }}>
      <div className="private-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-brown)', fontFamily: 'var(--font-heading)', margin: 0 }}>Panel Financiero</h1>
        <p style={{ color: 'var(--text-brown)', opacity: 0.6, fontSize: '1rem' }}>Visión consolidada y proyecciones estratégicas de La Magdalena</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', alignItems: 'start' }}>

        {/* Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '2rem' }}>
          
          {/* Month Selector */}
          <section className="dashboard-card" style={{ padding: '1.5rem', backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-brown)', opacity: 0.5, marginBottom: '1.25rem' }}>Períodos de Análisis</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {months.map(m => {
                const active = selectedMonths.includes(m.name)
                return (
                  <button
                    key={m.name}
                    onClick={() => toggleMonth(m.name)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.75rem 1rem', borderRadius: '8px', cursor: 'pointer',
                      backgroundColor: active ? 'rgba(212,255,0,0.1)' : 'transparent',
                      border: `1px solid ${active ? 'var(--accent-lime)' : 'transparent'}`,
                      transition: 'all 0.2s ease', textAlign: 'left'
                    }}
                  >
                    <span style={{ fontSize: '0.9rem', fontWeight: active ? 600 : 400, color: 'var(--text-brown)' }}>{m.name}</span>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: active ? 'var(--accent-lime)' : '#eee' }} />
                  </button>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button onClick={() => setSelectedMonths(months.map(m => m.name))} style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem', border: '1px solid #eee', borderRadius: '6px', color: '#888' }}>Todos</button>
              <button onClick={() => setSelectedMonths([])} style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem', border: '1px solid #eee', borderRadius: '6px', color: '#888' }}>Ninguno</button>
            </div>
          </section>

          {/* AI Tools */}
          <section className="dashboard-card" style={{ padding: '1.5rem', backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-brown)', opacity: 0.5, marginBottom: '1.25rem' }}>Generación de Informes</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {QUICK_PROMPTS.map(p => (
                <button
                  key={p.label}
                  onClick={() => handleSend(p.text, p.label)}
                  disabled={isLoading || selectedMonths.length === 0}
                  style={{
                    padding: '0.6rem 0.8rem', borderRadius: '6px', textAlign: 'left',
                    fontSize: '0.85rem', color: 'var(--text-brown)', border: '1px solid #f0f0f0',
                    backgroundColor: '#fafafa', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = '#fafafa'}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </section>
        </aside>

        {/* Main Content */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* KPI Row */}
          {summary && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
              {[
                { label: 'Facturación Bruta', value: summary.totals.facturacion, color: 'var(--text-brown)', sub: `${summary.monthly.length} meses` },
                { label: 'Ingresos Netos', value: summary.totals.ingresos, color: 'var(--text-brown)', sub: 'Excl. IVA' },
                { 
                  label: 'Egresos Totales', 
                  value: summary.totals.costos, 
                  color: '#ff6b6b', 
                  sub: summary.totals.ingresos > 0 ? `${((summary.totals.costos / summary.totals.ingresos) * 100).toFixed(1)}% de ingresos` : '0%' 
                },
                { 
                  label: 'Flujo Neto', 
                  value: summary.totals.flujoNeto, 
                  color: summary.totals.flujoNeto >= 0 ? '#27ae60' : '#ff6b6b',
                  sub: summary.totals.ingresos > 0 ? `Margen: ${((summary.totals.flujoNeto / summary.totals.ingresos) * 100).toFixed(1)}%` : 'Margen: 0%'
                },
              ].map(kpi => (
                <div key={kpi.label} style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888', marginBottom: '0.5rem' }}>{kpi.label}</p>
                  <p style={{ fontSize: '1.6rem', fontWeight: 800, color: kpi.color, margin: 0 }}>
                    ${(kpi.value / 1e6).toFixed(1)}M
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.5rem', margin: 0 }}>{kpi.sub}</p>
                </div>
              ))}
            </div>
          )}

          {/* Health Summary */}
          {summary && (
            <div style={{ 
              padding: '1.5rem', 
              backgroundColor: 'var(--text-brown)', 
              borderRadius: '12px', 
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '2rem'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Análisis de Salud Financiera</h3>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '20px', 
                    fontSize: '0.75rem', 
                    fontWeight: 700,
                    backgroundColor: summary.totals.margen > 15 ? '#27ae60' : summary.totals.margen > 0 ? 'var(--accent-lime)' : '#ff6b6b',
                    color: summary.totals.margen > 15 ? '#fff' : '#000'
                  }}>
                    {isNaN(summary.totals.margen) ? 'N/A' : summary.totals.margen > 15 ? 'EXCELENTE' : summary.totals.margen > 0 ? 'SALUDABLE' : 'CRÍTICO'}
                  </span>
                </div>
                <p style={{ fontSize: '0.9rem', opacity: 0.8, margin: 0, lineHeight: 1.5 }}>
                  {isNaN(summary.totals.margen) 
                    ? 'No hay datos suficientes para un análisis.'
                    : summary.totals.margen > 15 
                      ? 'La operación mantiene una rentabilidad sólida. Buen momento para considerar inversiones o expansión.' 
                      : summary.totals.margen > 0 
                        ? 'La operación es rentable pero el margen es ajustado. Se recomienda vigilar los costos operativos y optimizar proveedores.' 
                        : 'Alerta: Los egresos superan o igualan los ingresos netos. Es urgente revisar la estructura de costos y la estrategia de precios.'}
                </p>
              </div>
              <div style={{ textAlign: 'right', minWidth: '150px' }}>
                <p style={{ fontSize: '0.7rem', opacity: 0.6, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Punto de Eq. (Promedio Mensual)</p>
                <p style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                  {formatCurrency((summary.totals.ingresos - summary.totals.flujoNeto) / summary.monthly.length)}
                </p>
              </div>
            </div>
          )}

          {/* Charts Row */}
          {summary && isMounted && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
              
              {/* Trend Chart */}
              <div style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f0f0f0', minHeight: '400px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-brown)', margin: 0 }}>Evolución Mensual</h3>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.7rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-lime)' }} /> Facturación</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><div style={{ width: '8px', height: '8px', border: '1px dashed #ff6b6b' }} /> Costos</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorFact" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent-lime)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--accent-lime)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} tickFormatter={(v) => `$${v/1e6}M`} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      formatter={(v: any) => formatCurrency(Number(v))}
                    />
                    <Area type="monotone" dataKey="Facturación" stroke="var(--accent-lime)" strokeWidth={3} fillOpacity={1} fill="url(#colorFact)" />
                    <Area type="monotone" dataKey="Costos" stroke="#ff6b6b" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Composition Chart & List */}
              <div style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-brown)', margin: 0 }}>Distribución de Gastos</h3>
                
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={summary.costosPorCategoria}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="total"
                      nameKey="categoria"
                    >
                      {summary.costosPorCategoria.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(v: any) => formatCurrency(Number(v))} />
                  </PieChart>
                </ResponsiveContainer>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[...summary.costosPorCategoria].sort((a,b) => b.total - a.total).slice(0, 5).map((c, idx) => (
                    <div key={c.categoria} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span style={{ color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>{c.categoria}</span>
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--text-brown)' }}>{((c.total / summary.totals.costos) * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Monthly Table */}
          {summary && (
            <div style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-brown)' }}>Detalle por Período</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--accent-lime)', backgroundColor: '#fafafa' }}>
                      <th style={{ textAlign: 'left', padding: '1rem' }}>Mes</th>
                      <th style={{ textAlign: 'right', padding: '1rem' }}>Facturación</th>
                      <th style={{ textAlign: 'right', padding: '1rem' }}>Costos</th>
                      <th style={{ textAlign: 'right', padding: '1rem' }}>Flujo Neto</th>
                      <th style={{ textAlign: 'right', padding: '1rem' }}>Margen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.monthly.map(m => (
                      <tr key={m.name} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '1rem', fontWeight: 600 }}>{m.name}</td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>{formatCurrency(m.facturacion)}</td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>{formatCurrency(m.costos)}</td>
                        <td style={{ padding: '1rem', textAlign: 'right', color: m.flujoNeto >= 0 ? '#27ae60' : '#ff6b6b' }}>
                          {formatCurrency(m.flujoNeto)}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>{m.margen.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reports History */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div ref={reportsTopRef} />
            
            {reports.map(entry => (
              <article key={entry.id} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
                <header style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-brown)' }}>{entry.promptLabel}</h4>
                    <span style={{ fontSize: '0.7rem', color: '#888' }}>{entry.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => printReportPDF(entry.content, entry.months)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', border: '1px solid #eee', borderRadius: '4px' }}>PDF</button>
                    <button onClick={() => downloadReportExcel(entry.content, entry.months)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', backgroundColor: 'var(--accent-lime)', borderRadius: '4px', fontWeight: 700 }}>Excel</button>
                  </div>
                </header>
                <div style={{ padding: '2rem' }}>
                  {entry.status === 'loading' ? (
                    <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>Generando análisis inteligente...</div>
                  ) : entry.status === 'error' ? (
                    <div style={{ color: '#ff6b6b' }}>Error: {entry.errorMessage}</div>
                  ) : (
                    <div className="prose">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          table: p => <div style={{ overflowX: 'auto', margin: '1.5rem 0' }}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} {...p} /></div>,
                          th: p => <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '2px solid var(--accent-lime)', backgroundColor: '#fafafa' }} {...p} />,
                          td: p => <td style={{ padding: '0.75rem', borderBottom: '1px solid #eee' }} {...p} />,
                          p: p => <p style={{ lineHeight: 1.8, marginBottom: '1rem', color: '#444' }} {...p} />,
                          h1: p => <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-brown)' }} {...p} />,
                          h2: p => <h2 style={{ fontSize: '1.2rem', marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-brown)' }} {...p} />,
                        }}
                      >
                        {entry.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>

        </main>
      </div>
    </div>
  )
}
