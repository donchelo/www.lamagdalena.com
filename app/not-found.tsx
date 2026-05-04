import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-cream)', color: 'var(--text-brown)', fontFamily: 'var(--font-body)' }}>
      <h1 style={{ fontSize: 'clamp(4rem, 12vw, 8rem)', fontWeight: 700, fontFamily: 'var(--font-heading)', lineHeight: 1, margin: 0 }}>404</h1>
      <p style={{ fontSize: '1.2rem', marginTop: '1rem', opacity: 0.6 }}>Página no encontrada</p>
      <Link href="/" style={{ marginTop: '2rem', color: 'var(--text-brown)', borderBottom: '1px solid var(--text-brown)', textDecoration: 'none', fontSize: '0.9rem', letterSpacing: '0.1em' }}>← Volver al inicio</Link>
    </div>
  )
}
