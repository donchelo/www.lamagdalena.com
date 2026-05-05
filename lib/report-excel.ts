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
