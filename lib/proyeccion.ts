import fs from 'fs'
import path from 'path'

const DOCS_DIR = path.join(process.cwd(), 'data', 'proyeccion')

export interface MonthFolder {
  name: string
  pdfCount: number
  csvReady: boolean
  hasIncomeFile: boolean
  hasBankStatement: boolean
  hasCashFlow: boolean
}

// ─── Financial summary types ──────────────────────────────────────────────────

export interface CsvRow {
  fecha: string; mes: string; tipo: string; numFact: string
  contraparte: string; nit: string; concepto: string
  subtotal: number; iva: number; total: number; archivo: string
}

export interface MonthlySummary {
  name: string; facturacion: number; ingresos: number; costos: number; flujoNeto: number
  margen: number; numFacturas: number
}

export interface FinancialSummary {
  months: string[]
  monthly: MonthlySummary[]
  totals: { facturacion: number; ingresos: number; costos: number; flujoNeto: number; margen: number }
  clienteIngresos: { nombre: string; total: number; pct: number }[]
  costosPorCategoria: { categoria: string; total: number; pct: number; numTrans: number }[]
  topProveedores: { nombre: string; total: number; categoria: string }[]
  iva: { cobrado: number; pagado: number; neto: number }
  ivaMonthly: IvaMonth[]
  ivaBimestres: IvaBimestre[]
  facturas: CsvRow[]
  duplicados: number
  cashFlow: CashFlowSummary
}

// ─── Flujo de caja (extractos bancarios) ──────────────────────────────────────
// NOTA: "flujoNeto"/"facturacion" arriba son CAUSACIÓN (facturas emitidas/recibidas,
// aunque no se hayan cobrado o pagado). `cashFlow` es la plata real que entró/salió
// del banco según los extractos — son dos cosas distintas y no deben confundirse.

export interface CashFlowMonth {
  name: string
  hasData: boolean
  saldoInicial: number
  entradas: number
  salidas: number
  trasladosNetos: number
  netoCaja: number
  saldoFinal: number
}

export interface CashFlowSummary {
  months: CashFlowMonth[]
  totals: { entradas: number; salidas: number; netoCaja: number }
}

export interface IvaMonth { name: string; cobrado: number; pagado: number; neto: number; acumulado: number }
export interface IvaBimestre { bimestre: string; cobrado: number; pagado: number; aPagar: number }

// ─── Categorization ───────────────────────────────────────────────────────────

const CAT_KEYWORDS: Record<string, string[]> = {
  'Talento humano': ['ANDRES CAMILO ROMERO', 'CAROLINA ROMERO', 'CATALINA ROMERO', 'DANIELA RESTREPO', 'NICOLAS GUTIERREZ', 'JOHN GUTIERREZ', 'JUAN PEDRO SIERRA', 'MARIA CAMILA ESCOBAR', 'MARIANO GARCIA', 'DIEGO ALEJANDRO CORREA', 'EDISON ANDRES VASCO', 'VERONICA', 'VERÓNICA'],
  'Transporte y combustible': ['DISTRACOM', 'JETSMART', 'SERVICENTROS', 'GRUPO ZUPETROL', 'EDS EL PRADO', 'EDS SAN SEBASTIAN', 'LILIANA MONTOYA', 'ESTACION DE SERVICIO'],
  'Almacenamiento': ['MEGA STORAGE'],
  'Tecnología': ['GOOGLE', 'ADOBE', 'SHOPIFY', 'PHMUSEUM', 'ANTHROPIC'],
  'Alimentación': ['CREPES', 'CASA BRAVA', 'COCOROLLO', 'AYAPEL', 'FRANQUICIAS', 'SANCHO PAISA', 'GANSO', 'DISTRITO CULINARIO', 'MARRIAGA', 'INVERSIONES MIRANORTE', 'GRUPO LHL'],
  'Producción creativa': ['LA R FRESH', 'REDACOL', 'GRAPH'],
}

function categorize(name: string): string {
  const up = name.toUpperCase()
  for (const [cat, kws] of Object.entries(CAT_KEYWORDS)) {
    if (kws.some(k => up.includes(k))) return cat
  }
  return 'Suministros y operación'
}

// ─── CSV parser ───────────────────────────────────────────────────────────────

function normalizeMonth(m: string): string {
  // Remove leading numbers, dots, and spaces: "1.ENERO 2026" or "01 ENERO 26" -> "ENERO 2026"
  let clean = m.replace(/^[\d\.]+\s*/, '').trim().toUpperCase()
  // Ensure year is 4 digits if it's 2 digits: "ENERO 26" -> "ENERO 2026"
  if (/\s\d{2}$/.test(clean)) {
    clean = clean.replace(/\s(\d{2})$/, ' 20$1')
  }
  return clean
}

function parseCSVRows(content: string, months: string[]): CsvRow[] {
  const normalizedSelected = months.map(normalizeMonth)
  
  return content.trim().split('\n').slice(1)
    .map(line => {
      const cols: string[] = []
      let cur = '', inQ = false
      for (const ch of line) {
        if (ch === '"') { inQ = !inQ; continue }
        if (ch === ',' && !inQ) { cols.push(cur); cur = ''; continue }
        cur += ch
      }
      cols.push(cur)
      return {
        fecha: cols[0] ?? '', mes: cols[1] ?? '', tipo: cols[2] ?? '',
        numFact: cols[3] ?? '', contraparte: cols[4] ?? '', nit: cols[5] ?? '',
        concepto: cols[6] ?? '', subtotal: parseFloat(cols[7]) || 0,
        iva: parseFloat(cols[8]) || 0, total: parseFloat(cols[9]) || 0,
        archivo: cols[10] ?? '',
      }
    })
    .filter(row => {
      if (!row.mes) return false
      const normMes = normalizeMonth(row.mes)
      return normalizedSelected.includes(normMes)
    })
}

// ─── computeSummary ───────────────────────────────────────────────────────────

export function computeSummary(months: string[]): FinancialSummary {
  const empty: FinancialSummary = {
    months, monthly: [],
    totals: { facturacion: 0, ingresos: 0, costos: 0, flujoNeto: 0, margen: 0 },
    clienteIngresos: [], costosPorCategoria: [], topProveedores: [],
    iva: { cobrado: 0, pagado: 0, neto: 0 }, ivaMonthly: [], ivaBimestres: [],
    facturas: [], duplicados: 0, cashFlow: computeCashFlow(months),
  }
  const consolidado = path.join(DOCS_DIR, '_consolidado.csv')
  if (!fs.existsSync(consolidado)) return empty

  const rows = parseCSVRows(fs.readFileSync(consolidado, 'utf-8'), months)
  const ingresos = rows.filter(r => r.tipo === 'INGRESO')
  const allCostos = rows.filter(r => r.tipo === 'COSTO')

  // Dedup costs
  const seen = new Set<string>()
  const costos: CsvRow[] = []
  let duplicados = 0
  for (const c of allCostos) {
    const key = `${c.numFact}|${c.mes}`
    if (seen.has(key) && c.total > 0) { duplicados++; continue }
    seen.add(key); costos.push(c)
  }

  const totFacturacion = ingresos.reduce((s, r) => s + r.total, 0)
  const totIngresos     = ingresos.reduce((s, r) => s + (r.subtotal || (r.total - r.iva)), 0)
  const totCostos       = costos.reduce((s, r) => s + r.total, 0)
  const totCostosNetos  = costos.reduce((s, r) => s + (r.subtotal || (r.total - r.iva)), 0)
  
  // Real Profit (Net vs Net)
  const realProfit = totIngresos - totCostosNetos

  // Monthly
  let ivaAcumulado = 0
  const ivaMonthly: IvaMonth[] = []
  const monthly: MonthlySummary[] = months.map(m => {
    const normTarget = normalizeMonth(m)
    const rMes = ingresos.filter(r => normalizeMonth(r.mes) === normTarget)
    const mFact = rMes.reduce((s, r) => s + r.total, 0)
    const mIng = rMes.reduce((s, r) => s + (r.subtotal || (r.total - r.iva)), 0)

    const cMes = costos.filter(r => normalizeMonth(r.mes) === normTarget)
    const mC = cMes.reduce((s, r) => s + r.total, 0)
    const mCNet = cMes.reduce((s, r) => s + (r.subtotal || (r.total - r.iva)), 0)

    // IVA del mes: lo cobrado en ventas (débito fiscal) vs lo pagado en compras
    // (descontable). "neto" es lo que tocaría pagarle a la DIAN si este mes
    // fuera un período de declaración; "acumulado" es el corrido del año.
    const ivaCobradoMes = rMes.reduce((s, r) => s + r.iva, 0)
    const ivaPagadoMes  = cMes.reduce((s, r) => s + r.iva, 0)
    ivaAcumulado += ivaCobradoMes - ivaPagadoMes
    ivaMonthly.push({ name: m, cobrado: ivaCobradoMes, pagado: ivaPagadoMes, neto: ivaCobradoMes - ivaPagadoMes, acumulado: ivaAcumulado })

    const prof = mIng - mCNet
    return {
      name: m,
      facturacion: mFact,
      ingresos: mIng,
      costos: mC,
      flujoNeto: prof, // Usamos utilidad neta operativa (causación, NO caja real — ver cashFlow)
      margen: mIng > 0 ? (prof / mIng) * 100 : 0,
      numFacturas: cMes.length
    }
  })

  const ivaBimestres = groupIvaByBimestre(ivaMonthly)

  // Clients (based on Gross Facturacion)
  const cliMap: Record<string, number> = {}
  for (const r of ingresos) cliMap[r.contraparte] = (cliMap[r.contraparte] || 0) + r.total
  const clienteIngresos = Object.entries(cliMap).sort((a, b) => b[1] - a[1])
    .map(([nombre, total]) => ({ nombre, total, pct: totFacturacion > 0 ? (total / totFacturacion) * 100 : 0 }))

  // Categories
  const catMap: Record<string, { total: number; count: number }> = {}
  for (const c of costos) {
    const cat = categorize(c.contraparte)
    if (!catMap[cat]) catMap[cat] = { total: 0, count: 0 }
    catMap[cat].total += c.total; catMap[cat].count++
  }
  const costosPorCategoria = Object.entries(catMap).sort((a, b) => b[1].total - a[1].total)
    .map(([categoria, d]) => ({ categoria, total: d.total, pct: totCostos > 0 ? (d.total / totCostos) * 100 : 0, numTrans: d.count }))

  // Top providers
  const provMap: Record<string, number> = {}
  for (const c of costos) provMap[c.contraparte] = (provMap[c.contraparte] || 0) + c.total
  const topProveedores = Object.entries(provMap).sort((a, b) => b[1] - a[1]).slice(0, 10)
    .map(([nombre, total]) => ({ nombre, total, categoria: categorize(nombre) }))

  const ivaCobrado = ingresos.reduce((s, r) => s + r.iva, 0)
  const ivaPagado  = costos.reduce((s, r) => s + r.iva, 0)

  return {
    months, monthly,
    totals: { 
      facturacion: totFacturacion, 
      ingresos: totIngresos, 
      costos: totCostos, 
      flujoNeto: realProfit,
      margen: totIngresos > 0 ? (realProfit / totIngresos) * 100 : 0 
    },
    clienteIngresos, costosPorCategoria, topProveedores,
    iva: { cobrado: ivaCobrado, pagado: ivaPagado, neto: ivaCobrado - ivaPagado },
    ivaMonthly, ivaBimestres,
    facturas: costos, duplicados,
    cashFlow: computeCashFlow(months),
  }
}

const BIMESTRE_LABELS = ['ENE-FEB', 'MAR-ABR', 'MAY-JUN', 'JUL-AGO', 'SEP-OCT', 'NOV-DIC']
const MONTH_NAMES = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE']

/** Agrupa el IVA mensual en los bimestres de declaración de la DIAN (ene-feb, mar-abr, ...). */
function groupIvaByBimestre(ivaMonthly: IvaMonth[]): IvaBimestre[] {
  const groups: Record<string, { cobrado: number; pagado: number }> = {}
  for (const m of ivaMonthly) {
    const match = normalizeMonth(m.name).match(/^([A-ZÁÉÍÓÚ]+)\s+(\d{4})$/)
    if (!match) continue
    const idx = MONTH_NAMES.indexOf(match[1])
    if (idx < 0) continue
    const label = `${BIMESTRE_LABELS[Math.floor(idx / 2)]} ${match[2]}`
    if (!groups[label]) groups[label] = { cobrado: 0, pagado: 0 }
    groups[label].cobrado += m.cobrado
    groups[label].pagado += m.pagado
  }
  return Object.entries(groups).map(([bimestre, d]) => ({ bimestre, cobrado: d.cobrado, pagado: d.pagado, aPagar: d.cobrado - d.pagado }))
}

// ─── Flujo de caja: lectura de flujo_caja.csv (generado por parse-extracto.mjs) ─

function splitCsvLine(line: string): string[] {
  const cols: string[] = []
  let cur = '', inQ = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; continue }
      inQ = !inQ; continue
    }
    if (ch === ',' && !inQ) { cols.push(cur); cur = ''; continue }
    cur += ch
  }
  cols.push(cur)
  return cols
}

function parseFlujoCajaCsv(filePath: string): { descripcion: string; valor: number; categoria: string }[] | null {
  if (!fs.existsSync(filePath)) return null
  const content = fs.readFileSync(filePath, 'utf-8').trim()
  const lines = content.split('\n')
  if (lines.length <= 1) return null
  return lines.slice(1).map(line => {
    const cols = splitCsvLine(line)
    return { descripcion: cols[1] ?? '', valor: parseFloat(cols[2]) || 0, categoria: cols[3] ?? '' }
  })
}

const CASH_ENTRADA_CATS = ['INGRESO_OPERATIVO', 'RENDIMIENTO', 'OTRO_INGRESO']
const CASH_SALIDA_CATS  = ['EGRESO_OPERATIVO', 'IMPUESTO', 'COSTO_FINANCIERO', 'OTRO_EGRESO']

export function computeCashFlow(months: string[]): CashFlowSummary {
  const cfMonths: CashFlowMonth[] = months.map(name => {
    const rows = parseFlujoCajaCsv(path.join(DOCS_DIR, name, 'flujo_caja.csv'))
    if (!rows) {
      return { name, hasData: false, saldoInicial: 0, entradas: 0, salidas: 0, trasladosNetos: 0, netoCaja: 0, saldoFinal: 0 }
    }
    const saldoInicial = rows.find(r => r.categoria === 'SALDO' && r.descripcion === 'SALDO_ANTERIOR')?.valor ?? 0
    const saldoFinal   = rows.find(r => r.categoria === 'SALDO' && r.descripcion === 'SALDO_ACTUAL')?.valor ?? 0
    const entradas = rows.filter(r => CASH_ENTRADA_CATS.includes(r.categoria)).reduce((s, r) => s + r.valor, 0)
    const salidas  = Math.abs(rows.filter(r => CASH_SALIDA_CATS.includes(r.categoria)).reduce((s, r) => s + r.valor, 0))
    const trasladosNetos = rows.filter(r => r.categoria === 'TRASLADO_INTERNO').reduce((s, r) => s + r.valor, 0)
    return { name, hasData: true, saldoInicial, entradas, salidas, trasladosNetos, netoCaja: entradas - salidas, saldoFinal }
  })

  const totals = cfMonths.reduce((acc, m) => {
    acc.entradas += m.entradas; acc.salidas += m.salidas; acc.netoCaja += m.netoCaja
    return acc
  }, { entradas: 0, salidas: 0, netoCaja: 0 })

  return { months: cfMonths, totals }
}

// ─── Helpers de filesystem ────────────────────────────────────────────────────


function countFilesInDir(dir: string): number {
  try {
    let count = 0
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry)
      const stat = fs.statSync(full)
      if (stat.isDirectory()) {
        count += countFilesInDir(full)
      } else {
        count++
      }
    }
    return count
  } catch { return 0 }
}

function dirExists(p: string): boolean {
  try { return fs.statSync(p).isDirectory() } catch { return false }
}

function hasFilesInDir(dir: string): boolean {
  try {
    if (!dirExists(dir)) return false
    const entries = fs.readdirSync(dir)
    for (const entry of entries) {
      const full = path.join(dir, entry)
      const stat = fs.statSync(full)
      if (stat.isFile()) return true
      if (stat.isDirectory() && hasFilesInDir(full)) return true
    }
    return false
  } catch { return false }
}

function findPDFsInDir(dir: string, base = ''): string[] {
  const results: string[] = []
  try {
    for (const entry of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, entry)
      const rel = base ? path.join(base, entry) : entry
      if (fs.statSync(fullPath).isDirectory()) {
        results.push(...findPDFsInDir(fullPath, rel))
      } else if (['.pdf', '.xml'].includes(path.extname(entry).toLowerCase())) {
        results.push(rel)
      }
    }
  } catch { /* skip unreadable */ }
  return results
}

// ─── Lectura del _consolidado.csv ─────────────────────────────────────────────

function readCSV(filePath: string): string {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines   = content.trim().split('\n')
    if (lines.length <= 1) return ''
    return content
  } catch { return '' }
}

function consolidadoHasMonth(csvContent: string, monthName: string): boolean {
  const normalizedTarget = normalizeMonth(monthName)
  const lines = csvContent.split('\n').slice(1)
  return lines.some(line => {
    // Extract the Mes column (2nd column) to avoid false positives in other columns
    const cols = line.split(',')
    if (cols.length < 2) return false
    return normalizeMonth(cols[1]) === normalizedTarget
  })
}

// ─── Listar meses ─────────────────────────────────────────────────────────────

export function listMonths(): MonthFolder[] {
  if (!fs.existsSync(DOCS_DIR)) return []

  const consolidado     = path.join(DOCS_DIR, '_consolidado.csv')
  const consolidadoText = readCSV(consolidado)

  return fs.readdirSync(DOCS_DIR)
    .filter(name => {
      if (name.startsWith('.') || name.startsWith('_') || name === 'informes') return false
      try { return fs.statSync(path.join(DOCS_DIR, name)).isDirectory() } catch { return false }
    })
    .map(name => {
      const monthDir    = path.join(DOCS_DIR, name)

      // Egresos: contar archivos en Egresos/FACTURAS/
      const facturasDir = path.join(monthDir, 'Egresos', 'FACTURAS')
      const pdfCount    = countFilesInDir(facturasDir)

      // Ingresos: ¿hay archivos xlsx en Ingresos/?
      const ingresosDir  = path.join(monthDir, 'Ingresos')
      const hasIncomeFile = hasFilesInDir(ingresosDir)

      // Admon: ¿hay extracto bancario en Admon/?
      const admonDir       = path.join(monthDir, 'Admon')
      const hasBankStatement = hasFilesInDir(admonDir)

      // Flujo de caja: ¿el extracto ya fue parseado a flujo_caja.csv?
      const hasCashFlow = fs.existsSync(path.join(monthDir, 'flujo_caja.csv'))

      // CSV: ¿el consolidado tiene filas de este mes?
      const csvReady = consolidadoText ? consolidadoHasMonth(consolidadoText, name) : false

      return {
        name,
        pdfCount,
        csvReady,
        hasIncomeFile,
        hasBankStatement,
        hasCashFlow,
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}

// ─── Carga de contexto de ingresos desde _consolidado.csv ────────────────────

export function loadIncomeContext(months: string[]): string {
  const consolidado = path.join(DOCS_DIR, '_consolidado.csv')
  if (!fs.existsSync(consolidado)) return ''

  const content = readCSV(consolidado)
  if (!content) return ''

  const lines  = content.split('\n')
  const header = lines[0]
  const normalizedSelected = months.map(normalizeMonth)
  const rows = lines.slice(1).filter(line => {
    const cols = line.split(',')
    if (cols.length < 2) return false
    const normLineMes = normalizeMonth(cols[1])
    return normalizedSelected.includes(normLineMes) && line.includes('INGRESO')
  })
  if (rows.length === 0) return ''
  return [header, ...rows].join('\n')
}

// ─── Carga de contexto de costos desde _consolidado.csv ──────────────────────

export function loadCostContext(months: string[]): string {
  const consolidado = path.join(DOCS_DIR, '_consolidado.csv')
  if (fs.existsSync(consolidado)) {
    const content = readCSV(consolidado)
    if (content) {
      const lines  = content.split('\n')
      const header = lines[0]
      const normalizedSelected = months.map(normalizeMonth)
      const rows = lines.slice(1).filter(line => {
        const cols = line.split(',')
        if (cols.length < 2) return false
        const normLineMes = normalizeMonth(cols[1])
        return normalizedSelected.includes(normLineMes) && (line.includes('COSTO') || line.includes('EGRESO'))
      })
      if (rows.length > 0) return [header, ...rows].join('\n')
    }
  }

  // Fallback: CSVs individuales por mes
  const allLines: string[] = []
  let headerAdded = false

  for (const month of months) {
    const csvName = `_resumen_${month.replace(/\s+/g, '_')}.csv`
    const csvPath = path.join(DOCS_DIR, month, csvName)
    const content = readCSV(csvPath)
    if (!content) continue
    const lines = content.split('\n')
    if (!headerAdded) { allLines.push(lines[0]); headerAdded = true }
    allLines.push(...lines.slice(1).filter(Boolean))
  }

  return allLines.join('\n')
}

// ─── loadIncomePDFs (mantenido por compatibilidad — retorna vacío) ────────────
// Los ingresos ahora vienen del _consolidado.csv, no de PDFs.

export function loadIncomePDFs(_months: string[]): { name: string; month: string; data: Uint8Array }[] {
  return []
}

// ─── System prompt ────────────────────────────────────────────────────────────

export function buildSystemPrompt(months: string[], costCSV: string, _incomePDFCount: number): string {
  const monthsDesc = months.length === 0 ? 'ninguno' : months.join(', ')

  // Cargar ingresos también del consolidado
  const incomeCSV = loadIncomeContext(months)

  // Flujo de caja (extractos bancarios) e IVA — se calculan aparte de los CSVs
  // de arriba para poder darle al modelo la distinción explícita entre
  // facturación (causación) y caja real, y el detalle de IVA cobrado/pagado.
  const cashFlow = computeCashFlow(months)
  const cashFlowSection = cashFlow.months.some(m => m.hasData)
    ? `FLUJO DE CAJA — DATOS ESTRUCTURADOS (banco real, extractos en carpeta Admon/):
| Mes | Saldo inicial | Entradas | Salidas | Traslados internos | Neto de caja | Saldo final |
|---|---|---|---|---|---|---|
${cashFlow.months.map(m => m.hasData
      ? `| ${m.name} | ${Math.round(m.saldoInicial)} | ${Math.round(m.entradas)} | ${Math.round(m.salidas)} | ${Math.round(m.trasladosNetos)} | ${Math.round(m.netoCaja)} | ${Math.round(m.saldoFinal)} |`
      : `| ${m.name} | sin extracto bancario disponible |  |  |  |  |  |`).join('\n')}`
    : 'No hay extractos bancarios parseados para los meses seleccionados.'

  // IVA cobrado (ventas) vs pagado (compras), mensual, acumulado y por bimestre DIAN
  const { ivaMonthly, ivaBimestres } = computeSummary(months)
  const ivaSection = ivaMonthly.length
    ? `IVA — COBRADO VS PAGADO (débito fiscal vs descontable):
| Mes | IVA cobrado (ventas) | IVA pagado (compras) | Neto del mes | Acumulado del año |
|---|---|---|---|---|
${ivaMonthly.map(m => `| ${m.name} | ${Math.round(m.cobrado)} | ${Math.round(m.pagado)} | ${Math.round(m.neto)} | ${Math.round(m.acumulado)} |`).join('\n')}

Por bimestre de declaración DIAN (lo que efectivamente toca pagar o queda a favor cada declaración):
| Bimestre | IVA cobrado | IVA pagado | A pagar a la DIAN |
|---|---|---|---|
${ivaBimestres.map(b => `| ${b.bimestre} | ${Math.round(b.cobrado)} | ${Math.round(b.pagado)} | ${Math.round(b.aPagar)} |`).join('\n')}`
    : 'No hay datos de IVA disponibles para los meses seleccionados.'

  const costSection = costCSV
    ? `EGRESOS / COSTOS — DATOS ESTRUCTURADOS (facturas electrónicas DIAN, carpeta Egresos/FACTURAS/):
Columnas: fecha, mes, tipo, numeroFactura, contraparte, contraparteNIT, concepto, subtotal, iva, total, archivo

\`\`\`csv
${costCSV}
\`\`\``
    : 'No hay datos de costos disponibles para los meses seleccionados.'

  const incomeSection = incomeCSV
    ? `INGRESOS — DATOS ESTRUCTURADOS (carpeta Ingresos/, reportes de ventas por cliente):
Columnas: fecha, mes, tipo, numeroFactura, contraparte, contraparteNIT, concepto, subtotal, iva, total, archivo

\`\`\`csv
${incomeCSV}
\`\`\``
    : 'No hay datos de ingresos disponibles para los meses seleccionados.'

  return `Eres un analista financiero senior de La Magdalena, una agencia creativa colombiana (NIT: 901578370).

ESTRUCTURA CONTABLE:
- Ingresos: reportes de ventas por cliente en carpeta Ingresos/ (xlsx → CSV)
- Egresos: facturas electrónicas DIAN en carpeta Egresos/FACTURAS/
- Admon: extractos bancarios en carpeta Admon/

PERÍODOS ANALIZADOS: ${monthsDesc}

${incomeSection}

${costSection}

${cashFlowSection}

${ivaSection}

INSTRUCCIONES DE FORMATO (CRÍTICO):
- OBLIGATORIO: Tu PRIMERA línea debe ser exactamente: # PERÍODO ANALIZADO: ${monthsDesc}
  No pongas nada antes. No lo omitas. No lo muevas.
- Incluye una columna "Mes" o "Período" en TODAS las tablas de datos.
- Usa TABLAS de Markdown para todos los resúmenes, comparativas y proyecciones.
- Deja una línea en blanco ANTES y DESPUÉS de cada tabla.
- Formatea montos en COP con separadores de miles (ej: $1.250.000 COP).
- Usa **negritas** para cifras totales y KPIs importantes.
- Estructura la respuesta con encabezados claros (## Resumen, ### Proyecciones, etc.).
- Si falta información para un mes, menciónalo explícitamente.

INSTRUCCIONES DE ANÁLISIS:
- Los INGRESOS y COSTOS están en los CSVs estructurados — úsalos directamente.
- CRÍTICO — no confundas facturación con flujo de caja, son conceptos DISTINTOS:
  · "Flujo Neto" / "Resultado" (tabla de EGRESOS/INGRESOS) = Total Ingresos − Total Costos, en CAUSACIÓN
    (factura emitida o recibida, se haya cobrado/pagado o no).
  · "Flujo de caja" (tabla FLUJO DE CAJA) = plata que realmente entró/salió del banco según el extracto.
    "Entradas" y "Salidas" excluyen los "Traslados internos" (movimientos a/desde fondo de inversión,
    Nequi, cajero propio — no son ingreso ni gasto real).
  Si el usuario pregunta por "flujo de caja", "plata real", "lo que entró al banco" o similar, usa
  SIEMPRE la tabla de FLUJO DE CAJA, nunca el Flujo Neto de facturación. Si pregunta por "facturación",
  "resultado" o "utilidad", usa la tabla de INGRESOS/COSTOS. Si el extracto de un mes no está disponible,
  dilo explícitamente en vez de inferir caja a partir de facturación.
- IVA: distingue siempre IVA cobrado (en ventas) de IVA pagado (en compras). El monto "a pagar a la DIAN"
  es por bimestre de declaración (tabla IVA — bimestres), no el total acumulado del año salvo que te pidan
  el acumulado explícitamente.
- Si hay duplicados en el CSV (mismo número de factura), cuéntalos una sola vez.
- Al proyectar, muestra explícitamente los supuestos (ej: "Basado en el promedio de los últimos 3 meses...").
- Responde siempre en español.`
}
