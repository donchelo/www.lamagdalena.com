/**
 * parse-facturas.mjs
 * Parser de Facturas Electrónicas DIAN → CSV estructurado para análisis con IA.
 * Uso: node scripts/parse-facturas.mjs
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { XMLParser } from 'fast-xml-parser'
import { fileURLToPath } from 'url'
import XLSX from 'xlsx'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..', 'data', 'proyeccion')
const LA_MAGDALENA_NIT = '901578370'

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseAttributeValue: false,   // keep all as strings — avoids numeric NIT issues
  trimValues: true,
  cdataPropName: '__cdata',
  allowBooleanAttributes: true,
  isArray: (name) => ['cac:InvoiceLine', 'cac:TaxTotal', 'cbc:Note'].includes(name),
})

// ─── Safe accessors ───────────────────────────────────────────────────────────

/** Extrae el texto de un nodo que puede ser string o { #text, @_... } */
function val(node) {
  if (node === null || node === undefined) return ''
  if (typeof node === 'object') return String(node['#text'] ?? '').trim()
  return String(node).trim()
}

/** Extrae monto numérico de un nodo de moneda { #text: "166442.00", @_currencyID: "COP" } */
function amount(node) {
  const v = parseFloat(val(node).replace(/[^0-9.]/g, ''))
  return isNaN(v) ? 0 : v
}

function fmtCOP(n) {
  return n.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

// ─── Extractor de Invoice UBL (el XML real dentro del CDATA) ─────────────────

function extractInvoice(xmlStr) {
  let doc
  try { doc = xmlParser.parse(xmlStr) } catch { return null }

  const inv = doc?.Invoice
  if (!inv) return null

  // Proveedor/Vendedor
  const supParty = inv['cac:AccountingSupplierParty']?.['cac:Party']
  const supScheme = supParty?.['cac:PartyTaxScheme'] ?? supParty?.['cac:PartyLegalEntity']
  const supplierNIT  = val(supScheme?.['cbc:CompanyID'])
  const supplierName = val(supScheme?.['cbc:RegistrationName'] ?? supParty?.['cac:PartyName']?.['cbc:Name'])

  // Comprador
  const cusParty = inv['cac:AccountingCustomerParty']?.['cac:Party']
  const cusScheme = cusParty?.['cac:PartyTaxScheme'] ?? cusParty?.['cac:PartyLegalEntity']
  const customerNIT  = val(cusScheme?.['cbc:CompanyID'])
  const customerName = val(cusScheme?.['cbc:RegistrationName'] ?? cusParty?.['cac:PartyName']?.['cbc:Name'])

  // Montos
  const monetary  = inv['cac:LegalMonetaryTotal']
  const subtotal  = amount(monetary?.['cbc:LineExtensionAmount'])
  const iva       = amount(inv['cac:TaxTotal']?.[0]?.['cbc:TaxAmount'] ?? inv['cac:TaxTotal']?.['cbc:TaxAmount'])
  const total     = amount(monetary?.['cbc:PayableAmount'] ?? monetary?.['cbc:TaxInclusiveAmount'])

  // Concepto — primera línea de la factura
  const lines   = inv['cac:InvoiceLine'] ?? []
  const lineArr = Array.isArray(lines) ? lines : [lines]
  const notes   = inv['cbc:Note'] ?? []
  const noteArr = Array.isArray(notes) ? notes : [notes]
  const concept = val(
    lineArr[0]?.['cbc:Note'] ??
    lineArr[0]?.['cac:Item']?.['cbc:Description'] ??
    noteArr[0]
  ).slice(0, 150)

  const invoiceId = val(inv['cbc:ID'])
  const date      = val(inv['cbc:IssueDate'])

  return { invoiceId, date, supplierNIT, supplierName, customerNIT, customerName, subtotal, iva, total, concept }
}

// ─── Extractor de AttachedDocument (el contenedor externo DIAN) ──────────────

function extractAttachedDocument(xmlStr) {
  let doc
  try { doc = xmlParser.parse(xmlStr) } catch { return null }

  const root = doc?.AttachedDocument
  if (!root) return null

  // Caso 1: hay Invoice embebido en CDATA
  const cdata = root?.['cac:Attachment']?.['cac:ExternalReference']?.['cbc:Description']?.['__cdata']
  if (cdata) {
    const embedded = extractInvoice(cdata)
    if (embedded) return embedded
  }

  // Caso 2: el outer document tiene sus propios datos (sin Invoice embebido)
  const sender   = root?.['cac:SenderParty']
  const receiver = root?.['cac:ReceiverParty']

  const supplierNIT  = val(sender?.['cac:PartyTaxScheme']?.['cbc:CompanyID'] ?? sender?.['cbc:CompanyID'])
  const supplierName = val(sender?.['cac:PartyTaxScheme']?.['cbc:RegistrationName'] ?? sender?.['cbc:RegistrationName'])
  const customerNIT  = val(receiver?.['cac:PartyTaxScheme']?.['cbc:CompanyID'] ?? receiver?.['cbc:CompanyID'])
  const customerName = val(receiver?.['cac:PartyTaxScheme']?.['cbc:RegistrationName'] ?? receiver?.['cbc:RegistrationName'])

  const monetary = root?.['cac:LegalMonetaryTotal']
  const subtotal = amount(monetary?.['cbc:LineExtensionAmount'])
  const iva      = amount(monetary?.['cbc:TaxExclusiveAmount'])
  const total    = amount(monetary?.['cbc:PayableAmount'] ?? monetary?.['cbc:TaxInclusiveAmount'])

  if (total === 0 && subtotal === 0) return null

  const invoiceId = val(root?.['cbc:ID'] ?? root?.['cbc:ParentDocumentID'])
  const date      = val(root?.['cbc:IssueDate'])
  const notes     = root?.['cbc:Note'] ?? []
  const noteArr   = Array.isArray(notes) ? notes : [notes]
  const concept   = val(noteArr[0]).slice(0, 150)

  return { invoiceId, date, supplierNIT, supplierName, customerNIT, customerName, subtotal, iva, total, concept }
}

// ─── Clasificar y construir fila CSV ─────────────────────────────────────────

function parseXmlFile(filePath) {
  let xmlStr
  try { xmlStr = fs.readFileSync(filePath, 'utf-8') } catch { return null }

  let result = null

  if (xmlStr.includes('<AttachedDocument')) {
    result = extractAttachedDocument(xmlStr)
  } else if (xmlStr.includes('<Invoice ')) {
    result = extractInvoice(xmlStr)
  }

  if (!result || result.total === 0) return null

  const lmIsSupplier = result.supplierNIT === LA_MAGDALENA_NIT
  const lmIsCustomer = result.customerNIT === LA_MAGDALENA_NIT

  if (!lmIsSupplier && !lmIsCustomer) return null

  return {
    fecha:          result.date,
    tipo:           lmIsSupplier ? 'INGRESO' : 'COSTO',
    numeroFactura:  result.invoiceId,
    contraparte:    lmIsSupplier ? result.customerName  : result.supplierName  || '(desconocido)',
    contraparteNIT: lmIsSupplier ? result.customerNIT   : result.supplierNIT,
    concepto:       result.concept,
    subtotal:       result.subtotal,
    iva:            result.iva,
    total:          result.total,
    archivo:        path.basename(filePath),
  }
}

// ─── Parser de Excel wijmo (Siigo/Alegra export) ────────────────────────────
// El software contable (wijmo) exporta con dimension incorrecta y filas collapsed.
// Se necesita nodim:true para leer los datos reales.

function readWijmoSheet(filePath) {
  try {
    const wb = XLSX.readFile(filePath, { nodim: true, cellStyles: false })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const cells = Object.keys(ws).filter(k => !k.startsWith('!'))
    if (!cells.length) return []
    let minR=Infinity, maxR=-Infinity, minC=Infinity, maxC=-Infinity
    for (const addr of cells) {
      const ref = XLSX.utils.decode_cell(addr)
      minR=Math.min(minR,ref.r); maxR=Math.max(maxR,ref.r)
      minC=Math.min(minC,ref.c); maxC=Math.max(maxC,ref.c)
    }
    const rows = []
    for (let R=minR; R<=maxR; R++) {
      const row = []
      for (let C=minC; C<=maxC; C++) {
        const cell = ws[XLSX.utils.encode_cell({r:R,c:C})]
        row.push(cell ? cell.v : '')
      }
      rows.push(row)
    }
    return rows
  } catch { return [] }
}

// Busca el índice de la fila de cabeceras (la que tiene 'Identificación' o 'Tipo de transacción')
function findHeaderRow(rows, marker) {
  return rows.findIndex(r => r.some(v => String(v).trim() === marker))
}

function colIdx(headers, name) {
  return headers.findIndex(h => String(h).trim() === name)
}

// IVA estándar en Colombia (19%). Se usa SOLO para el export "Ventas.xlsx" de
// Siigo (ver abajo), que no trae el desglose subtotal/IVA por fila — a
// diferencia del export histórico "Ventas por cliente.xlsx" que sí lo trae.
const IVA_RATE = 0.19

// Parsea Ventas por cliente.xlsx (formato histórico, con Subtotal/Impuesto
// cargo por fila) → filas INGRESO
function parseVentasXlsx(filePath, month) {
  const rows = readWijmoSheet(filePath)
  const hi = findHeaderRow(rows, 'Identificación')
  if (hi < 0) return []

  const h = rows[hi]
  const iId      = colIdx(h, 'Identificación')
  const iCliente = colIdx(h, 'Cliente')
  const iSubtot  = colIdx(h, 'Subtotal')
  const iIVA     = colIdx(h, 'Impuesto cargo')
  const iTotal   = colIdx(h, 'Total')

  // Extraer período del encabezado (ej. "De Abril 01 2026 a Abril 30 2026")
  const periodoRow = rows.find(r => String(r[0]).startsWith('De '))
  const periodo = periodoRow ? String(periodoRow[0]).trim() : month

  const result = []
  for (let i = hi + 1; i < rows.length; i++) {
    const r = rows[i]
    if (!r[0] || String(r[0]).startsWith('Total') || String(r[0]).startsWith('Procesado')) continue
    const nit   = String(r[iId] ?? '').trim()
    const name  = String(r[iCliente] ?? '').trim()
    const sub   = Number(r[iSubtot]) || 0
    const iva   = Number(r[iIVA])    || 0
    const total = Number(r[iTotal])  || 0
    if (!name || total === 0) continue
    result.push({
      fecha:          '',          // ventas no tienen fecha única por fila
      mes:            month,
      tipo:           'INGRESO',
      numeroFactura:  '',
      contraparte:    name,
      contraparteNIT: nit,
      concepto:       `Ventas ${periodo}`,
      subtotal:       sub,
      iva:            iva,
      total:          total,
      archivo:        path.basename(filePath),
    })
  }
  return result
}

// Parsea Ventas.xlsx (export "Tipo de transacción" de Siigo, sin desglose de
// IVA por fila — solo trae el Total con impuestos incluidos). El subtotal/IVA
// se calcula aplicando el 19% estándar colombiano (verificado contra el
// export histórico: el mismo cliente/período da el mismo Total con esa tasa).
// Notas crédito restan (mismo criterio que parseDocSoporteXlsx).
function parseVentasSiigoXlsx(filePath, month) {
  const rows = readWijmoSheet(filePath)
  const hi = findHeaderRow(rows, 'Tipo de transacción')
  if (hi < 0) return []

  const h = rows[hi]
  const iTipo   = colIdx(h, 'Tipo de transacción')
  const iComp   = colIdx(h, 'Comprobante')
  const iFecha  = colIdx(h, 'Fecha elaboración')
  const iId     = colIdx(h, 'Identificación')
  const iCliente = colIdx(h, 'Cliente')
  const iTotal  = colIdx(h, 'Total')

  const result = []
  for (let i = hi + 1; i < rows.length; i++) {
    const r = rows[i]
    if (!r[0] || String(r[0]).startsWith('Procesado')) continue
    const tipo   = String(r[iTipo]    ?? '').trim()
    const comp   = String(r[iComp]    ?? '').trim()
    const fecha  = String(r[iFecha]   ?? '').trim()
    const nit    = String(r[iId]      ?? '').trim()
    const name   = String(r[iCliente] ?? '').trim()
    const total  = Number(r[iTotal])  || 0
    if (!name || total === 0) continue

    let fechaISO = ''
    const fm = fecha.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    if (fm) fechaISO = `${fm[3]}-${fm[2]}-${fm[1]}`

    const signo = /nota\s*cr[ée]dito/i.test(tipo) ? -1 : 1
    const totalSigned = signo * total
    const sub = totalSigned / (1 + IVA_RATE)
    const iva = totalSigned - sub

    result.push({
      fecha:          fechaISO,
      mes:            month,
      tipo:           'INGRESO',
      numeroFactura:  comp,
      contraparte:    name,
      contraparteNIT: nit,
      concepto:       `Ventas ${month} (IVA 19% estimado — export sin desglose)`,
      subtotal:       sub,
      iva:            iva,
      total:          totalSigned,
      archivo:        path.basename(filePath),
    })
  }
  return result
}

// Parsea Documento soporte.xlsx → filas COSTO
function parseDocSoporteXlsx(filePath, month) {
  const rows = readWijmoSheet(filePath)
  const hi = findHeaderRow(rows, 'Tipo de transacción')
  if (hi < 0) return []

  const h = rows[hi]
  const iTipo     = colIdx(h, 'Tipo de transacción')
  const iComp     = colIdx(h, 'Comprobante')
  const iFacProv  = colIdx(h, 'Factura proveedor')
  const iFecha    = colIdx(h, 'Fecha elaboración')
  const iId       = colIdx(h, 'Identificación')
  const iProv     = colIdx(h, 'Proveedor')
  const iValor    = colIdx(h, 'Valor')

  const result = []
  for (let i = hi + 1; i < rows.length; i++) {
    const r = rows[i]
    if (!r[0] || String(r[0]).startsWith('Procesado')) continue
    const tipo   = String(r[iTipo]    ?? '').trim()
    const comp   = String(r[iComp]    ?? '').trim()
    const facProv= String(r[iFacProv] ?? '').trim()
    const fecha  = String(r[iFecha]   ?? '').trim()
    const nit    = String(r[iId]      ?? '').trim()
    const prov   = String(r[iProv]    ?? '').trim()
    const valor  = Number(r[iValor])  || 0
    if (!prov || valor === 0) continue

    // Convertir fecha dd/mm/yyyy → yyyy-mm-dd
    let fechaISO = ''
    const fm = fecha.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    if (fm) fechaISO = `${fm[3]}-${fm[2]}-${fm[1]}`

    // Las notas débito son créditos (descuentos) — se registran con signo negativo
    const signo = tipo === 'Nota débito' ? -1 : 1

    result.push({
      fecha:          fechaISO,
      mes:            month,
      tipo:           'COSTO',
      numeroFactura:  facProv || comp,
      contraparte:    prov,
      contraparteNIT: nit,
      concepto:       tipo,
      subtotal:       signo * valor,
      iva:            0,
      total:          signo * valor,
      archivo:        path.basename(filePath),
    })
  }
  return result
}

// ─── Utilidades de filesystem ─────────────────────────────────────────────────

function findXmls(dir) {
  const results = []
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry)
    try {
      if (fs.statSync(full).isDirectory()) results.push(...findXmls(full))
      else if (entry.toLowerCase().endsWith('.xml')) results.push(full)
    } catch { /* skip */ }
  }
  return results
}

function extractZips(dir) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry)
    try {
      if (fs.statSync(full).isDirectory()) { extractZips(full); continue }
      if (!entry.toLowerCase().endsWith('.zip')) continue
      const extractDir = full.replace(/\.zip$/i, '_extracted')
      if (!fs.existsSync(extractDir)) {
        fs.mkdirSync(extractDir, { recursive: true })
        execSync(`unzip -o "${full}" -d "${extractDir}"`, { stdio: 'pipe' })
        console.log(`  📦 Extraído: ${path.basename(full)}`)
      }
    } catch (e) {
      console.warn(`  ⚠️  ZIP error ${entry}: ${e.message}`)
    }
  }
}

// ─── CSV ──────────────────────────────────────────────────────────────────────

const HEADERS = ['fecha', 'mes', 'tipo', 'numeroFactura', 'contraparte', 'contraparteNIT', 'concepto', 'subtotal', 'iva', 'total', 'archivo']

function escapeCSV(v) {
  const s = String(v ?? '')
  return (s.includes(',') || s.includes('"') || s.includes('\n')) ? `"${s.replace(/"/g, '""')}"` : s
}

function writeCsv(filePath, rows) {
  const lines = [HEADERS.join(','), ...rows.map(r => HEADERS.map(h => escapeCSV(r[h])).join(','))]
  fs.writeFileSync(filePath, lines.join('\n'), 'utf-8')
}

function parseCsvLine(line) {
  const cols = []
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

/** Lee un CSV con las columnas de HEADERS (con o sin `mes`) → filas objeto. */
function readCsvRows(filePath) {
  if (!fs.existsSync(filePath)) return []
  const lines = fs.readFileSync(filePath, 'utf-8').trim().split('\n')
  if (lines.length <= 1) return []
  const header = parseCsvLine(lines[0])
  return lines.slice(1).map(line => {
    const cols = parseCsvLine(line)
    const row = {}
    header.forEach((h, i) => { row[h.trim()] = cols[i] ?? '' })
    row.subtotal = parseFloat(row.subtotal) || 0
    row.iva      = parseFloat(row.iva) || 0
    row.total    = parseFloat(row.total) || 0
    return row
  })
}

// Parsea egresos_manuales.csv (curado a mano desde PDFs de cuenta de cobro y
// facturas en USD convertidas a TRM oficial, mientras contabilidad entrega el
// export "Documento soporte" de Siigo) → filas COSTO
function parseEgresosManualesCsv(filePath, month) {
  return readCsvRows(filePath)
    .filter(r => r.contraparte && r.total !== 0)
    .map(r => ({ ...r, mes: month, tipo: r.tipo || 'COSTO' }))
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function summary(rows) {
  const ing  = rows.filter(r => r.tipo === 'INGRESO')
  const cos  = rows.filter(r => r.tipo === 'COSTO')
  const tIng = ing.reduce((s, r) => s + r.total, 0)
  const tCos = cos.reduce((s, r) => s + r.total, 0)
  console.log(`  ┌──────────────────────────────────────────────┐`)
  console.log(`  │  Ingresos  (${String(ing.length).padStart(3)} registros)  COP ${fmtCOP(tIng).padStart(14)} │`)
  console.log(`  │  Costos    (${String(cos.length).padStart(3)} registros)  COP ${fmtCOP(tCos).padStart(14)} │`)
  console.log(`  │  Flujo neto                COP ${fmtCOP(tIng - tCos).padStart(14)} │`)
  console.log(`  └──────────────────────────────────────────────┘`)
}

console.log('\n🔍 Parser Facturas DIAN — La Magdalena\n')

if (!fs.existsSync(ROOT)) { console.error(`❌ No existe: ${ROOT}`); process.exit(1) }

// --months "5.MAYO 2026,6.JUNIO 2026" → modo incremental: solo procesa esos
// meses y conserva las filas de los demás meses del _consolidado.csv existente
// (los xlsx fuente de meses viejos pueden ya no estar en el repo).
const monthsArgIdx = process.argv.indexOf('--months')
const onlyMonths = monthsArgIdx > -1
  ? process.argv[monthsArgIdx + 1].split(',').map(s => s.trim()).filter(Boolean)
  : null

// Extraer ZIPs
console.log('📦 Extrayendo ZIPs...')
extractZips(ROOT)

const monthDirs = fs.readdirSync(ROOT)
  .filter(n => !n.startsWith('.') && !n.startsWith('_') && n !== 'informes' && fs.statSync(path.join(ROOT, n)).isDirectory())
  .filter(n => !onlyMonths || onlyMonths.includes(n))
  .sort()

console.log(`\n📂 Meses: ${monthDirs.join(' | ')}${onlyMonths ? '  (modo incremental)' : ''}\n`)

const allRows = []

for (const month of monthDirs) {
  const monthDir  = path.join(ROOT, month)
  // Los xlsx de Siigo viven en Ingresos/ (layout actual) o ventas/ (layout viejo)
  const ventasDir = ['Ingresos', 'ventas']
    .map(d => path.join(monthDir, d))
    .find(d => fs.existsSync(d)) ?? path.join(monthDir, 'ventas')
  const xmlFiles  = findXmls(monthDir)
  console.log(`⚡ ${month}  (${xmlFiles.length} XMLs)`)

  const monthRows = []
  let parsed = 0

  // 1. XMLs DIAN
  for (const f of xmlFiles) {
    const row = parseXmlFile(f)
    if (row) { row.mes = month; monthRows.push(row); allRows.push(row); parsed++ }
  }
  console.log(`   ✅ ${parsed} facturas DIAN  |  ⏭  ${xmlFiles.length - parsed} omitidos`)

  // 2. Excel ventas/ (Ventas por cliente + Documento soporte)
  if (fs.existsSync(ventasDir)) {
    const xlsxFiles = fs.readdirSync(ventasDir).filter(f => f.endsWith('.xlsx') && !f.startsWith('~') && !f.startsWith('.~'))
    let ventasRows = 0, soporteRows = 0
    for (const f of xlsxFiles) {
      const full = path.join(ventasDir, f)
      if (/ventas por cliente/i.test(f)) {
        const rows = parseVentasXlsx(full, month)
        rows.forEach(r => { monthRows.push(r); allRows.push(r) })
        ventasRows += rows.length
      } else if (/^ventas\b/i.test(f)) {
        // Formato nuevo de Siigo ("Ventas.xlsx"): sin desglose de IVA por fila.
        const rows = parseVentasSiigoXlsx(full, month)
        rows.forEach(r => { monthRows.push(r); allRows.push(r) })
        ventasRows += rows.length
      } else if (/documento soporte/i.test(f)) {
        const rows = parseDocSoporteXlsx(full, month)
        rows.forEach(r => { monthRows.push(r); allRows.push(r) })
        soporteRows += rows.length
      }
    }
    if (ventasRows)  console.log(`   📊 ${ventasRows} ventas (Ventas por cliente.xlsx / Ventas.xlsx)`)
    if (soporteRows) console.log(`   📄 ${soporteRows} doc soporte (costos sin factura electrónica)`)
  }

  // 3. egresos_manuales.csv (cuentas de cobro sin XML + facturas USD a TRM oficial)
  const ccRows = parseEgresosManualesCsv(path.join(monthDir, 'egresos_manuales.csv'), month)
  if (ccRows.length) {
    ccRows.forEach(r => { monthRows.push(r); allRows.push(r) })
    console.log(`   🧾 ${ccRows.length} egresos manuales (egresos_manuales.csv)`)
  }

  monthRows.sort((a, b) => a.fecha.localeCompare(b.fecha))
  summary(monthRows)

  const csvPath = path.join(monthDir, `_resumen_${month.replace(/\s+/g, '_')}.csv`)
  writeCsv(csvPath, monthRows)
  console.log(`   💾 ${path.relative(path.join(__dirname, '..'), csvPath)}\n`)
}

allRows.sort((a, b) => a.fecha.localeCompare(b.fecha))
const consolidado = path.join(ROOT, '_consolidado.csv')

let finalRows = allRows
if (onlyMonths) {
  // Conservar intactas las filas de los meses NO procesados
  const kept = readCsvRows(consolidado).filter(r => !onlyMonths.includes(r.mes))
  finalRows = [...kept, ...allRows]
  console.log(`♻️  Modo incremental: ${kept.length} filas previas conservadas + ${allRows.length} nuevas`)
}
writeCsv(consolidado, finalRows)

console.log('══════════════════════════════════════════════════')
console.log('📊 CONSOLIDADO')
summary(finalRows)
console.log(`\n💾 data/proyeccion/_consolidado.csv  (${finalRows.length} registros)\n`)
