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

// Extraer ZIPs
console.log('📦 Extrayendo ZIPs...')
extractZips(ROOT)

const monthDirs = fs.readdirSync(ROOT)
  .filter(n => !n.startsWith('.') && !n.startsWith('_') && fs.statSync(path.join(ROOT, n)).isDirectory())
  .sort()

console.log(`\n📂 Meses: ${monthDirs.join(' | ')}\n`)

const allRows = []

for (const month of monthDirs) {
  const monthDir = path.join(ROOT, month)
  const xmlFiles = findXmls(monthDir)
  console.log(`⚡ ${month}  (${xmlFiles.length} XMLs)`)

  const monthRows = []
  let parsed = 0

  for (const f of xmlFiles) {
    const row = parseXmlFile(f)
    if (row) { row.mes = month; monthRows.push(row); allRows.push(row); parsed++ }
  }

  monthRows.sort((a, b) => a.fecha.localeCompare(b.fecha))
  console.log(`   ✅ ${parsed} facturas encontradas  |  ⏭  ${xmlFiles.length - parsed} omitidos`)
  summary(monthRows)

  const csvPath = path.join(monthDir, `_resumen_${month.replace(/\s+/g, '_')}.csv`)
  writeCsv(csvPath, monthRows)
  console.log(`   💾 ${path.relative(path.join(__dirname, '..'), csvPath)}\n`)
}

allRows.sort((a, b) => a.fecha.localeCompare(b.fecha))
const consolidado = path.join(ROOT, '_consolidado.csv')
writeCsv(consolidado, allRows)

console.log('══════════════════════════════════════════════════')
console.log('📊 CONSOLIDADO ENERO–ABRIL 2026')
summary(allRows)
console.log(`\n💾 data/proyeccion/_consolidado.csv  (${allRows.length} registros)\n`)
