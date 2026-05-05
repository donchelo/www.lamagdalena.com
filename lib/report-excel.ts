'use client'

import * as XLSX from 'xlsx'

function safeName(raw: string, used: Set<string>): string {
  let name = raw.replace(/[\\/*?[\]:]/g, '').trim().substring(0, 31)
  if (!name) name = 'Tabla'
  let candidate = name
  let suffix = 2
  while (used.has(candidate)) {
    candidate = name.substring(0, 28) + `_${suffix++}`
  }
  used.add(candidate)
  return candidate
}

interface TableSection {
  heading: string
  rows: string[][]
}

function parseMarkdown(markdown: string): { narrative: string[]; tables: TableSection[] } {
  const lines = markdown.split('\n')
  const narrative: string[] = []
  const tables: TableSection[] = []

  let currentHeading = ''
  let tableBuffer: string[] = []

  function flushTable() {
    if (tableBuffer.length === 0) return
    const rows: string[][] = []
    for (const line of tableBuffer) {
      // Skip separator rows like |---|---|
      if (/^\|[\s\-:|]+\|/.test(line)) continue
      const cells = line
        .split(/(?<!\\)\|/)
        .slice(1, -1)
        .map(c => c.trim())
      if (cells.length > 0) rows.push(cells)
    }
    if (rows.length > 1) {
      tables.push({ heading: currentHeading || `Tabla_${tables.length + 1}`, rows })
    }
    tableBuffer = []
  }

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,3}\s+(.+)/)
    if (headingMatch) {
      flushTable()
      currentHeading = headingMatch[1].trim()
      narrative.push(currentHeading)
      continue
    }
    if (line.trimStart().startsWith('|')) {
      tableBuffer.push(line)
      continue
    }
    flushTable()
    // Strip markdown syntax for narrative
    const clean = line
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      .trim()
    if (clean) narrative.push(clean)
  }
  flushTable()

  return { narrative, tables }
}

export function parseMarkdownToExcel(markdown: string, months: string[], dateStr: string): ArrayBuffer {
  const wb = XLSX.utils.book_new()
  const used = new Set<string>()
  const { narrative, tables } = parseMarkdown(markdown)

  // Sheet 1: full narrative text
  const narrativeAoA: string[][] = [
    ['INFORME FINANCIERO — LA MAGDALENA'],
    [`Período: ${months.join(', ')}`],
    [`Generado: ${dateStr}`],
    [],
    ...narrative.map(l => [l]),
  ]
  const wsNarrative = XLSX.utils.aoa_to_sheet(narrativeAoA)
  wsNarrative['!cols'] = [{ wch: 100 }]
  used.add('Informe')
  XLSX.utils.book_append_sheet(wb, wsNarrative, 'Informe')

  // One sheet per table
  const periodValue = months.join(' | ')
  for (const section of tables) {
    const rowsWithPeriod = section.rows.map((row, i) =>
      i === 0 ? ['Período', ...row] : [periodValue, ...row]
    )
    const ws = XLSX.utils.aoa_to_sheet(rowsWithPeriod)
    ws['!cols'] = rowsWithPeriod[0]?.map(() => ({ wch: 22 })) ?? []
    const sheetName = safeName(section.heading, used)
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
  }

  return XLSX.write(wb, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer
}

function markdownToHtml(md: string): string {
  return md
    .split('\n')
    .reduce((acc, line, _i, lines) => {
      // Tables: collect consecutive | lines and flush as <table>
      void lines
      if (line.trimStart().startsWith('|')) {
        if (!acc.inTable) {
          acc.html += '<table><thead>'
          acc.inTable = true
          acc.tableRowCount = 0
        }
        if (/^\|[\s\-:|]+\|/.test(line)) {
          // separator — close thead, open tbody
          acc.html += '</thead><tbody>'
          return acc
        }
        const cells = line.split(/(?<!\\)\|/).slice(1, -1).map(c => c.trim())
        const tag = acc.tableRowCount === 0 ? 'th' : 'td'
        acc.html += `<tr>${cells.map(c => `<${tag}>${escHtml(c)}</${tag}>`).join('')}</tr>`
        acc.tableRowCount++
        return acc
      }
      if (acc.inTable) {
        acc.html += '</tbody></table>'
        acc.inTable = false
      }
      // Headings
      const h1 = line.match(/^# (.+)/)
      if (h1) { acc.html += `<h1>${escHtml(h1[1])}</h1>`; return acc }
      const h2 = line.match(/^## (.+)/)
      if (h2) { acc.html += `<h2>${escHtml(h2[1])}</h2>`; return acc }
      const h3 = line.match(/^### (.+)/)
      if (h3) { acc.html += `<h3>${escHtml(h3[1])}</h3>`; return acc }
      // Blank line
      if (!line.trim()) { acc.html += '<br>'; return acc }
      // Paragraph with inline bold/italic/code
      const para = line
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
      acc.html += `<p>${para}</p>`
      return acc
    }, { html: '', inTable: false, tableRowCount: 0 } as { html: string; inTable: boolean; tableRowCount: number }).html
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function printReportPDF(content: string, months: string[]) {
  const origin = window.location.origin
  const dateStr = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
  const body = markdownToHtml(content)

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Informe Financiero — La Magdalena</title>
<style>
  @font-face {
    font-family: 'Neue Haas Display';
    src: url('${origin}/fonts/NeueHaasDisplayBold.ttf') format('truetype');
    font-weight: 700;
  }
  @font-face {
    font-family: 'Neue Haas Display';
    src: url('${origin}/fonts/NeueHaasDisplayMediu.ttf') format('truetype');
    font-weight: 500;
  }
  @font-face {
    font-family: 'Neue Haas Display';
    src: url('${origin}/fonts/NeueHaasDisplayRoman.ttf') format('truetype');
    font-weight: 400;
  }
  @font-face {
    font-family: 'Helvetica Neue Light';
    src: url('${origin}/fonts/HelveticaNeueLight.ttf') format('truetype');
    font-weight: 300;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Helvetica Neue Light', Helvetica, Arial, sans-serif;
    font-weight: 300;
    font-size: 10.5pt;
    line-height: 1.7;
    color: #111;
    background: #fff;
    max-width: 900px;
    margin: 0 auto;
    padding: 2.5cm 2.8cm;
  }

  /* ── Cover strip ── */
  .pdf-cover {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 3px solid #0a0a0a;
    padding-bottom: 1.2rem;
    margin-bottom: 2rem;
  }
  .pdf-cover img {
    height: 36px;
    width: auto;
    display: block;
  }
  .pdf-cover-meta {
    text-align: right;
  }
  .pdf-cover-meta .label {
    font-family: 'Neue Haas Display', Helvetica, sans-serif;
    font-weight: 700;
    font-size: 7.5pt;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #888;
    display: block;
  }
  .pdf-cover-meta .date {
    font-family: 'Neue Haas Display', Helvetica, sans-serif;
    font-weight: 400;
    font-size: 9pt;
    color: #333;
    display: block;
    margin-top: 0.15rem;
  }

  /* ── Accent bar below cover ── */
  .pdf-accent-bar {
    height: 4px;
    background: #eef151;
    margin-bottom: 2rem;
    width: 60px;
  }

  /* ── Typography ── */
  h1 {
    font-family: 'Neue Haas Display', Helvetica, sans-serif;
    font-weight: 700;
    font-size: 18pt;
    line-height: 1.15;
    color: #0a0a0a;
    margin: 0 0 1.5rem;
    letter-spacing: -0.02em;
  }
  h2 {
    font-family: 'Neue Haas Display', Helvetica, sans-serif;
    font-weight: 700;
    font-size: 12pt;
    letter-spacing: 0.01em;
    color: #0a0a0a;
    margin: 2rem 0 0.6rem;
    padding-bottom: 0.4rem;
    border-bottom: 1px solid #e8e8e8;
  }
  h3 {
    font-family: 'Neue Haas Display', Helvetica, sans-serif;
    font-weight: 500;
    font-size: 10.5pt;
    color: #222;
    margin: 1.4rem 0 0.4rem;
  }
  p  { margin: 0 0 0.7rem; }
  br { display: block; margin: 0.25rem 0; content: ''; }
  strong {
    font-family: 'Neue Haas Display', Helvetica, sans-serif;
    font-weight: 700;
    color: #0a0a0a;
  }
  em     { font-style: italic; }
  code   {
    font-family: 'Courier New', monospace;
    font-size: 9pt;
    background: #f5f5f5;
    padding: 0.1em 0.35em;
    border-radius: 2px;
  }

  /* ── Tables ── */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0 1.5rem;
    font-size: 9pt;
    page-break-inside: avoid;
  }
  thead { background: #0a0a0a; }
  th {
    font-family: 'Neue Haas Display', Helvetica, sans-serif;
    font-weight: 700;
    font-size: 8pt;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #eef151;
    padding: 0.55rem 0.75rem;
    text-align: left;
    white-space: nowrap;
  }
  td {
    padding: 0.45rem 0.75rem;
    border-bottom: 1px solid #ebebeb;
    vertical-align: top;
    color: #222;
  }
  tr:nth-child(even) td { background: #fafafa; }
  tr:last-child td { border-bottom: 2px solid #0a0a0a; }

  /* ── Footer ── */
  .pdf-footer {
    margin-top: 3rem;
    padding-top: 0.8rem;
    border-top: 1px solid #ddd;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .pdf-footer span {
    font-family: 'Neue Haas Display', Helvetica, sans-serif;
    font-weight: 400;
    font-size: 7.5pt;
    color: #aaa;
    letter-spacing: 0.05em;
  }
  .pdf-footer .footer-accent {
    width: 20px;
    height: 3px;
    background: #eef151;
    display: inline-block;
    margin-right: 0.5rem;
    vertical-align: middle;
  }

  @media print {
    body { padding: 0; }
    @page { margin: 1.8cm 2.2cm; size: A4; }
    h2 { page-break-after: avoid; }
    table { page-break-inside: avoid; }
    .pdf-cover, h1 { page-break-after: avoid; }
  }
</style>
</head>
<body>

<div class="pdf-cover">
  <img src="${origin}/assets/logo-main.png" alt="La Magdalena" onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
  <span style="display:none;font-family:'Neue Haas Display',Helvetica,sans-serif;font-weight:700;font-size:14pt;color:#0a0a0a;letter-spacing:-0.02em;">La Magdalena</span>
  <div class="pdf-cover-meta">
    <span class="label">Informe Financiero</span>
    <span class="date">${escHtml(dateStr)}</span>
  </div>
</div>

<div class="pdf-accent-bar"></div>

${body}

<div class="pdf-footer">
  <span><span class="footer-accent"></span>Período: ${escHtml(months.join(', '))}</span>
  <span>La Magdalena · NIT 901578370 · Generado con IA</span>
</div>

</body>
</html>`

  const win = window.open('', '_blank', 'width=960,height=750')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
  // Wait for fonts to load before triggering print
  setTimeout(() => { win.print() }, 800)
}

export function downloadReportExcel(content: string, months: string[]) {
  const dateStr = new Date().toISOString().split('T')[0]
  const monthsSlug = months
    .join('_')
    .replace(/\s+/g, '-')
    .substring(0, 40)
  const filename = `Informe_LaMagdalena_${monthsSlug}_${dateStr}.xlsx`

  const data = parseMarkdownToExcel(content, months, dateStr)
  const blob = new Blob([data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
