/**
 * Returns a stable base URL for server-side use (e.g. Apify webhook URLs).
 * Priority: custom WEBHOOK_BASE_URL > VERCEL_PROJECT_PRODUCTION_URL (stable across deploys) >
 *           VERCEL_URL (deployment-specific) > NEXT_PUBLIC_BASE_URL (local dev).
 */
export function getBaseUrl(): string {
  if (process.env.WEBHOOK_BASE_URL) return process.env.WEBHOOK_BASE_URL
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
}
