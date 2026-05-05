import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div className="private-main">
      <div className="private-header">
        <h1 className="private-title">Panel Principal</h1>
        <p className="private-subtitle">Herramientas internas La Magdalena</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
        <Link href="/social-listening" style={{ display: 'block', padding: '2rem', border: '1px solid rgba(238, 241, 81, 0.3)', borderRadius: '4px', backgroundColor: 'rgba(238, 241, 81, 0.05)', textDecoration: 'none', transition: 'all 0.3s ease' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>◉</div>
          <h2 style={{ color: 'var(--private-accent)', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)', fontSize: '1.3rem' }}>Social Listening</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: 1.5 }}>Genera reportes de 8 páginas con análisis de redes sociales usando Apify + Claude.</p>
        </Link>

        <div style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', opacity: 0.4 }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>◎</div>
          <h2 style={{ color: 'var(--private-accent)', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)', fontSize: '1.3rem' }}>Agente de Conocimiento</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: 1.5 }}>Próximamente · Sube documentos y consulta con IA.</p>
        </div>

        <div style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', opacity: 0.4 }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⬡</div>
          <h2 style={{ color: 'var(--private-accent)', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)', fontSize: '1.3rem' }}>Conversor de Contenido</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: 1.5 }}>Próximamente · Convierte ideas en guiones, storyboards y captions.</p>
        </div>

        <Link href="/proyeccion-financiera" style={{ display: 'block', padding: '2rem', border: '1px solid rgba(238, 241, 81, 0.3)', borderRadius: '4px', backgroundColor: 'rgba(238, 241, 81, 0.05)', textDecoration: 'none', transition: 'all 0.3s ease' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>◇</div>
          <h2 style={{ color: 'var(--private-accent)', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)', fontSize: '1.3rem' }}>Proyección Financiera</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: 1.5 }}>Analiza ingresos y costos con IA. Proyecciones, márgenes y flujo de caja.</p>
        </Link>
      </div>
    </div>
  )
}
