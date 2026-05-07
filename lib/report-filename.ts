const NETWORK_ABBREV: Record<string, string> = {
  instagram: 'IG',
  tiktok: 'TK',
  twitter: 'TW',
  facebook: 'FB',
  youtube: 'YT',
}

function compactDate(iso: string): string {
  return iso.replace(/-/g, '')
}

function networksSlug(networks: string[]): string {
  return networks
    .map(n => NETWORK_ABBREV[n.toLowerCase()] ?? n.toUpperCase().slice(0, 2))
    .join('-')
}

function safeClientName(name: string): string {
  return name.trim().replace(/\s+/g, '-')
}

interface FilenameParams {
  clientName: string
  dateFrom: string
  dateTo: string
  networks: string[]
}

export function buildReportFilename({ clientName, dateFrom, dateTo, networks }: FilenameParams): string {
  return `Reporte-LaMagdalena-${safeClientName(clientName)}-${compactDate(dateFrom)}-${compactDate(dateTo)}-${networksSlug(networks)}.pdf`
}

export function buildOnePagerFilename({ clientName, dateFrom, dateTo, networks }: FilenameParams): string {
  return `OnePager-LaMagdalena-${safeClientName(clientName)}-${compactDate(dateFrom)}-${compactDate(dateTo)}-${networksSlug(networks)}.pdf`
}
