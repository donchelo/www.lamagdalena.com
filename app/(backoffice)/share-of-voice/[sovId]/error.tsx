'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function SovError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[SOV Dashboard Error]', error.message, error.digest)
  }, [error])

  return (
    <div className="private-main">
      <div style={{
        maxWidth: '520px', marginTop: '3rem',
        padding: '2rem', border: '1px solid rgba(255,80,80,0.3)',
        borderRadius: '4px', backgroundColor: 'rgba(255,80,80,0.05)',
      }}>
        <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#ff5050', marginBottom: '1rem' }}>
          Error al cargar el dashboard
        </p>
        <p style={{ color: 'var(--private-text)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          {error.message ?? 'Ocurrió un error inesperado.'}
        </p>
        {error.digest && (
          <p style={{ color: 'var(--private-text-muted)', fontSize: '0.7rem', marginBottom: '1.5rem', fontFamily: 'monospace' }}>
            ID: {error.digest}
          </p>
        )}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={reset} className="private-button"
            style={{ padding: '0.65rem 1.25rem', fontSize: '0.8rem', letterSpacing: '0.1em', backgroundColor: 'var(--private-accent)', border: 'none', borderRadius: '2px', color: 'var(--text-brown)', cursor: 'pointer', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
            REINTENTAR
          </button>
          <Link href="/share-of-voice"
            style={{ padding: '0.65rem 1.25rem', fontSize: '0.8rem', letterSpacing: '0.08em', border: '1px solid var(--private-border)', borderRadius: '2px', color: 'var(--private-text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            ← Volver
          </Link>
        </div>
      </div>
    </div>
  )
}
