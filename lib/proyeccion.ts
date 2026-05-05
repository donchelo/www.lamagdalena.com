import fs from 'fs'
import path from 'path'

export interface MonthFolder {
  name: string
  pdfCount: number
  csvReady: boolean   // true si ya se parseó el XML a CSV
  incomePDFCount: number
}

const DOCS_DIR = path.join(process.cwd(), 'data', 'proyeccion')

// Patrones de archivos que son INGRESOS: cuentas de cobro emitidas POR La Magdalena A clientes.
// Los archivos CDC, AIU, CC-, ACR, G REPRESENTACION, Las tres hermanas son COSTOS
// (contratistas cobrándole a La Magdalena) — NO deben incluirse aquí.
const INCOME_PATTERNS = [
  /^CUENTA[_ ]DE[_ ]COBRO/i,
]

function isIncomePDF(filename: string): boolean {
  return INCOME_PATTERNS.some(p => p.test(filename))
}

function findPDFsInDir(dir: string, base = ''): string[] {
  const results: string[] = []
  try {
    for (const entry of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, entry)
      const rel = base ? path.join(base, entry) : entry
      if (fs.statSync(fullPath).isDirectory()) {
        results.push(...findPDFsInDir(fullPath, rel))
      } else if (path.extname(entry).toLowerCase() === '.pdf') {
        results.push(rel)
      }
    }
  } catch { /* skip unreadable */ }
  return results
}

export function listMonths(): MonthFolder[] {
  if (!fs.existsSync(DOCS_DIR)) return []

  return fs.readdirSync(DOCS_DIR)
    .filter(name => {
      if (name.startsWith('.') || name.startsWith('_')) return false
      try { return fs.statSync(path.join(DOCS_DIR, name)).isDirectory() } catch { return false }
    })
    .map(name => {
      const monthDir = path.join(DOCS_DIR, name)
      const allPDFs  = findPDFsInDir(monthDir)
      const incomePDFs = allPDFs.filter(p => isIncomePDF(path.basename(p)))
      const csvName  = `_resumen_${name.replace(/\s+/g, '_')}.csv`
      const csvReady = fs.existsSync(path.join(monthDir, csvName))
      return {
        name,
        pdfCount: allPDFs.length,
        csvReady,
        incomePDFCount: incomePDFs.length,
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}

// ─── Carga del CSV de costos (generado por parse-facturas.mjs) ────────────────

function readCSV(filePath: string): string {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines   = content.trim().split('\n')
    if (lines.length <= 1) return ''
    return content
  } catch { return '' }
}

// ─── Carga de PDFs de ingresos (solo archivos de cobros/cuentas) ──────────────

export function loadIncomePDFs(months: string[]): { name: string; month: string; data: Uint8Array }[] {
  const result: { name: string; month: string; data: Uint8Array }[] = []

  for (const month of months) {
    const monthDir = path.join(DOCS_DIR, month)
    if (!fs.existsSync(monthDir)) continue

    const allPDFs = findPDFsInDir(monthDir)
    const incomePDFs = allPDFs.filter(p => isIncomePDF(path.basename(p)))

    for (const rel of incomePDFs) {
      const full = path.join(monthDir, rel)
      try {
        result.push({
          name:  path.basename(rel),
          month,
          data:  new Uint8Array(fs.readFileSync(full)),
        })
      } catch { /* skip */ }
    }
  }
  return result
}

// ─── Contexto CSV de costos ───────────────────────────────────────────────────

export function loadCostContext(months: string[]): string {
  // Intentar consolidado primero
  const consolidado = path.join(DOCS_DIR, '_consolidado.csv')
  if (fs.existsSync(consolidado)) {
    const content = readCSV(consolidado)
    if (content) {
      // Filtrar solo las filas de los meses seleccionados
      const lines  = content.split('\n')
      const header = lines[0]
      const rows   = lines.slice(1).filter(line => months.some(m => line.includes(m)))
      if (rows.length > 0) return [header, ...rows].join('\n')
    }
  }

  // Fallback: CSVs por mes
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

// ─── System prompt ────────────────────────────────────────────────────────────

export function buildSystemPrompt(months: string[], costCSV: string, incomePDFCount: number): string {
  const monthsDesc = months.length === 0 ? 'ninguno' : months.join(', ')

  const costSection = costCSV
    ? `COSTOS — DATOS ESTRUCTURADOS (extraídos de facturas electrónicas DIAN):
Columnas: fecha, mes, tipo, numeroFactura, contraparte, contraparteNIT, concepto, subtotal, iva, total, archivo

\`\`\`csv
${costCSV}
\`\`\``
    : 'No hay datos de costos disponibles. Ejecuta: node scripts/parse-facturas.mjs'

  const incomeSection = incomePDFCount > 0
    ? `INGRESOS — ${incomePDFCount} cuentas de cobro adjuntas, emitidas POR La Magdalena A sus clientes.
Estos documentos representan la facturación de La Magdalena. Extrae montos, fechas y clientes de los PDFs.
IMPORTANTE: los archivos CDC, AIU, CC-, ACR, G REPRESENTACION son costos de contratistas — NO son ingresos y no están adjuntos aquí.`
    : 'No hay cuentas de cobro de ingresos para los meses seleccionados.'

  return `Eres un analista financiero senior de La Magdalena, una agencia creativa colombiana (NIT: 901578370).

PERÍODOS ANALIZADOS: ${monthsDesc}

${costSection}

${incomeSection}

INSTRUCCIONES:
- Los COSTOS están en el CSV estructurado — úsalos directamente sin re-leerlos de PDFs
- Los INGRESOS están en los PDFs adjuntos — extrae montos y clientes de ahí
- Cuando calcules flujo neto: Ingresos (PDFs) - Costos (CSV)
- Si hay duplicados en el CSV (mismo número de factura), cuéntalos una sola vez
- Responde en español con números reales en COP
- Al proyectar, muestra explícitamente los supuestos usados`
}
