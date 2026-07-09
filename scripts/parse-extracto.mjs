/**
 * parse-extracto.mjs
 * Extractos bancarios Bancolombia (Admon/*.pdf) → flujo_caja.csv por mes.
 * Uso: node scripts/parse-extracto.mjs [--months "5.MAYO 2026,6.JUNIO 2026"]
 */

import fs from 'fs'
import path from 'path'
import { execFileSync } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..', 'data', 'proyeccion')

// ─── Categorización de movimientos ────────────────────────────────────────────
// El orden no importa: cada regla es un prefijo específico y no se solapan.
const CASH_RULES = [
  { categoria: 'INGRESO_OPERATIVO', re: /^(PAGO DE PROV|TRANSFERENCIA CTA SUC VIRTUAL)/i },
  { categoria: 'TRASLADO_INTERNO', re: /^(TRASLADO (A|DE) FONDO DE INVERS|TRANSFERENCIA CTA CAJERO|TRANSFERENCIA DESDE NEQUI)/i },
  { categoria: 'EGRESO_OPERATIVO', re: /^(PAGO A PROVE?|COMPRA (EN|INTL)|RETIRO CAJERO|PAGO PSE (WOMPI|SIIGO|CAMARA))/i },
  { categoria: 'IMPUESTO', re: /^((REV )?IMPTO GOBIERNO 4X|PAGO PSE IMPUESTO DIAN|(REV )?IVA CUOTA PLAN CANAL NEGOC|COBRO IVA PAGOS AUTOMATICOS)/i },
  { categoria: 'COSTO_FINANCIERO', re: /^((REV )?CUOTA (PLAN CANAL NEGOCIOS|MANEJO TRJ DEB)|C? ?MANEJO TARJ(ETA)? DEB|SERVICIO PAGO A (PROVEEDORES|OTROS BANCOS))/i },
  { categoria: 'RENDIMIENTO', re: /^(ABONO INTERESES AHORROS|AJUSTE INTERES AHORROS)/i },
]

function categorizeCash(desc, valor) {
  for (const { categoria, re } of CASH_RULES) {
    if (re.test(desc)) return categoria
  }
  return valor >= 0 ? 'OTRO_INGRESO' : 'OTRO_EGRESO'
}

// ─── Parser del PDF ────────────────────────────────────────────────────────────

const parseNum = (s) => parseFloat(s.replace(/,/g, ''))

function parseExtracto(pdfPath) {
  const text = execFileSync('pdftotext', ['-layout', pdfPath, '-'], { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 })

  const desde = text.match(/DESDE:\s*(\d{4})\/(\d{2})\/(\d{2})/)
  const hasta = text.match(/HASTA:\s*(\d{4})\/(\d{2})\/(\d{2})/)
  if (!desde || !hasta) return null // no es un extracto (ej. certificado bancario)

  const desdeY = +desde[1]
  const hastaY = +hasta[1], hastaM = +hasta[2]

  const saldoAnteriorM = text.match(/SALDO ANTERIOR\s+\$\s+([\d,]+\.\d{2})/)
  const totalAbonosM   = text.match(/TOTAL ABONOS\s+\$\s+([\d,]+\.\d{2})/)
  const totalCargosM   = text.match(/TOTAL CARGOS\s+\$\s+([\d,]+\.\d{2})/)
  const saldoActualM   = text.match(/SALDO ACTUAL\s+\$\s+([\d,]+\.\d{2})/)
  if (!saldoAnteriorM || !totalAbonosM || !totalCargosM || !saldoActualM) return null

  const saldoAnterior = parseNum(saldoAnteriorM[1])
  const totalAbonos   = parseNum(totalAbonosM[1])
  const totalCargos   = parseNum(totalCargosM[1])
  const saldoActual   = parseNum(saldoActualM[1])

  const rows = []
  // "1/05     ABONO INTERESES AHORROS          8.44         1,543,040.74"
  const re = /^\s*(\d{1,2})\/(\d{2})\s+(.+?)\s+(-?(?:[\d,]+)?\.\d{2})\s+((?:[\d,]+)?\.\d{2})\s*$/
  for (const line of text.split('\n')) {
    const m = line.match(re)
    if (!m) continue
    const [, dd, mm, desc, valorStr] = m
    const year = (+mm === hastaM) ? hastaY : desdeY
    const valor = parseNum(valorStr)
    rows.push({
      fecha: `${year}-${mm}-${dd.padStart(2, '0')}`,
      descripcion: desc.trim().replace(/\s+/g, ' '),
      valor,
      categoria: categorizeCash(desc.trim(), valor),
    })
  }

  // Checksum contra el resumen del propio extracto (tolerancia de redondeo: 1 peso)
  const saldoCalc = saldoAnterior + rows.reduce((s, r) => s + r.valor, 0)
  const abonosCalc = rows.filter(r => r.valor > 0).reduce((s, r) => s + r.valor, 0)
  const cargosCalc = Math.abs(rows.filter(r => r.valor < 0).reduce((s, r) => s + r.valor, 0))

  const errs = []
  if (Math.abs(saldoCalc - saldoActual) > 1) errs.push(`saldo: resumen=${saldoActual} calculado=${saldoCalc.toFixed(2)}`)
  if (Math.abs(abonosCalc - totalAbonos) > 1) errs.push(`abonos: resumen=${totalAbonos} calculado=${abonosCalc.toFixed(2)}`)
  if (Math.abs(cargosCalc - totalCargos) > 1) errs.push(`cargos: resumen=${totalCargos} calculado=${cargosCalc.toFixed(2)}`)
  if (errs.length) {
    throw new Error(`Checksum falló en ${path.basename(pdfPath)}: ${errs.join(' | ')}`)
  }

  return { saldoAnterior, saldoActual, totalAbonos, totalCargos, rows }
}

// ─── CSV ──────────────────────────────────────────────────────────────────────

const HEADERS = ['fecha', 'descripcion', 'valor', 'categoria', 'archivo']

function escapeCSV(v) {
  const s = String(v ?? '')
  return (s.includes(',') || s.includes('"') || s.includes('\n')) ? `"${s.replace(/"/g, '""')}"` : s
}

function writeCashCsv(filePath, extracto, archivo) {
  const rows = [
    { fecha: '', descripcion: 'SALDO_ANTERIOR', valor: extracto.saldoAnterior, categoria: 'SALDO', archivo },
    ...extracto.rows.map(r => ({ ...r, archivo })),
    { fecha: '', descripcion: 'SALDO_ACTUAL', valor: extracto.saldoActual, categoria: 'SALDO', archivo },
  ]
  const lines = [HEADERS.join(','), ...rows.map(r => HEADERS.map(h => escapeCSV(r[h])).join(','))]
  fs.writeFileSync(filePath, lines.join('\n'), 'utf-8')
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log('\n🏦 Parser Extractos Bancarios — La Magdalena\n')

if (!fs.existsSync(ROOT)) { console.error(`❌ No existe: ${ROOT}`); process.exit(1) }

const monthsArgIdx = process.argv.indexOf('--months')
const onlyMonths = monthsArgIdx > -1
  ? process.argv[monthsArgIdx + 1].split(',').map(s => s.trim()).filter(Boolean)
  : null

const monthDirs = fs.readdirSync(ROOT)
  .filter(n => !n.startsWith('.') && !n.startsWith('_') && n !== 'informes' && fs.statSync(path.join(ROOT, n)).isDirectory())
  .filter(n => !onlyMonths || onlyMonths.includes(n))
  .sort()

let procesados = 0, saltados = 0

for (const month of monthDirs) {
  const admonDir = path.join(ROOT, month, 'Admon')
  if (!fs.existsSync(admonDir)) { continue }
  const pdfs = fs.readdirSync(admonDir).filter(f => f.toLowerCase().endsWith('.pdf'))
  if (!pdfs.length) continue

  const pdfPath = path.join(admonDir, pdfs[0])
  console.log(`⚡ ${month}  (${pdfs[0]})`)

  const extracto = parseExtracto(pdfPath)
  if (!extracto) {
    console.log(`   ⏭  No es un extracto con movimientos (ej. certificado bancario) — omitido\n`)
    saltados++
    continue
  }

  const entradas = extracto.rows.filter(r => r.categoria === 'INGRESO_OPERATIVO').reduce((s, r) => s + r.valor, 0)
  const salidas  = Math.abs(extracto.rows.filter(r => ['EGRESO_OPERATIVO', 'IMPUESTO', 'COSTO_FINANCIERO'].includes(r.categoria)).reduce((s, r) => s + r.valor, 0))
  const traslados = extracto.rows.filter(r => r.categoria === 'TRASLADO_INTERNO').reduce((s, r) => s + r.valor, 0)
  const otros = extracto.rows.filter(r => r.categoria.startsWith('OTRO_'))

  console.log(`   ✅ ${extracto.rows.length} movimientos | checksum OK`)
  console.log(`   💰 Entradas operativas: ${entradas.toLocaleString('es-CO')}  |  Salidas operativas: ${salidas.toLocaleString('es-CO')}  |  Neto: ${(entradas - salidas).toLocaleString('es-CO')}`)
  console.log(`   🔄 Traslados internos (no operativos): ${traslados.toLocaleString('es-CO')}`)
  if (otros.length) {
    console.log(`   ⚠️  ${otros.length} movimientos sin categoría específica (OTRO_INGRESO/OTRO_EGRESO):`)
    otros.forEach(r => console.log(`      ${r.fecha}  ${r.descripcion}  ${r.valor}`))
  }

  const csvPath = path.join(ROOT, month, 'flujo_caja.csv')
  writeCashCsv(csvPath, extracto, pdfs[0])
  console.log(`   💾 ${path.relative(path.join(__dirname, '..'), csvPath)}\n`)
  procesados++
}

console.log('══════════════════════════════════════════════════')
console.log(`📊 ${procesados} meses procesados, ${saltados} omitidos (sin extracto de movimientos)\n`)
