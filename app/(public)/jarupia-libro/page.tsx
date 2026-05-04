import Link from 'next/link'

const rewards = [
  { price: '$150.000', description: '1 libro firmado por el autor.' },
  { price: '$450.000', description: '1 libro firmado + 1 fotografía impresa de la colección original del libro de 20x30cms.' },
  { price: '$500.000', description: '2 libros firmados + set completo de 5 postales impresas de la colección' },
  { price: '$1.350.000', description: '10 libros firmados + set completo de 10 postales impresas de la colección.' },
]

const photos = [
  '/assets/photos/jarupia/image-1.webp',
  '/assets/photos/jarupia/image-2.webp',
  '/assets/photos/jarupia/image-3.webp',
  '/assets/photos/jarupia/image-4.webp',
  '/assets/photos/jarupia/image-5.webp',
]

export default function JarupiaPage() {
  return (
    <main className="jarupia-page">
      <section className="jarupia-hero-banner" style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(/assets/photos/jarupia-featured.jpg)`,
        backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '90vh',
        display: 'flex', alignItems: 'center', color: 'white', marginTop: '-80px', position: 'relative',
      }}>
        <div className="container">
          <Link href="/" className="back-link" style={{ color: 'white', opacity: 0.8 }}>← Volver al inicio</Link>
          <div className="jarupia-hero-content" style={{ maxWidth: '800px' }}>
            <span className="case-study-label" style={{ color: 'var(--accent-lime)', marginBottom: '1rem' }}>OBRA LITERARIA</span>
            <h1 style={{ color: 'white', fontSize: 'clamp(4rem, 12vw, 8rem)', marginBottom: '1.5rem', lineHeight: 0.9, fontWeight: 700 }}>Jarupia</h1>
            <p className="lead" style={{ fontSize: 'clamp(1.2rem, 3vw, 2rem)', marginBottom: '2.5rem', fontWeight: 300, opacity: 0.9 }}>Un libro que nace en la Ciénaga de Ayapel</p>
            <h2 style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', fontWeight: 400, fontStyle: 'italic', maxWidth: '650px', lineHeight: 1.6, opacity: 0.85 }}>
              ¿Y si te dijeran que existe un lugar donde los árboles recuerdan la historia del mundo y los manatíes pueden salvarte la vida?
            </h2>
          </div>
        </div>
      </section>

      <section className="jarupia-details" style={{ padding: '10rem 0' }}>
        <div className="container">
          <div className="details-grid">
            <div className="details-image-main">
              <img src="/assets/photos/jarupia-real.webp" alt="Libro Jarupia" style={{ width: '100%', borderRadius: '4px', boxShadow: '0 40px 80px rgba(0,0,0,0.15)' }} />
            </div>
            <div className="details-text" style={{ alignSelf: 'center' }}>
              <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', marginBottom: '2.5rem', lineHeight: 1.1 }}>Fantasía y realidad <br />en un solo lugar</h2>
              <div style={{ fontSize: '1.2rem', color: '#444', lineHeight: 1.8 }}>
                <p style={{ marginBottom: '2rem' }}>Jarupia es un libro que mezcla la fantasía con la realidad. Una historia inspirada en la Ciénaga de Ayapel, uno de los ecosistemas más biodiversos y mágicos de Colombia.</p>
                <p style={{ marginBottom: '2rem' }}>Cuenta el viaje de Alejo, un joven que sufre un accidente y entra a un mundo oculto donde la naturaleza tiene sus propias reglas.</p>
                <p>Cuando vuelve, ya no es el mismo: ha despertado su poder interior y su misión es clara… cuidar la tierra que lo vio nacer.</p>
              </div>
              <div style={{ marginTop: '4rem' }}>
                <a href="https://wa.me/573042644962?text=Hola! Quiero adquirir el libro Jarupia" target="_blank" rel="noopener noreferrer" className="cta-button" style={{ padding: '1.2rem 3.5rem', fontSize: '0.9rem', borderRadius: '2px' }}>Adquirir el libro</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '10rem 0', backgroundColor: 'var(--text-brown)', color: 'white' }}>
        <div className="container">
          <h2 className="section-title" style={{ color: 'white', marginBottom: '4rem', fontSize: 'clamp(2rem, 5vw, 3rem)' }}>¿Por qué apoyar esta preventa?</h2>
          <p style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', lineHeight: 1.5, fontWeight: 300, maxWidth: '1000px' }}>
            <strong style={{ color: 'var(--accent-lime)' }}>Impacto más allá de la lectura:</strong> este es un proyecto expandido y además del libro tendremos acciones de restauración ecológica en el territorio.
          </p>
        </div>
      </section>

      <section className="jarupia-gallery-featured" style={{ padding: '10rem 0', backgroundColor: '#fff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '8rem' }}>
            <span className="case-study-label">NARRATIVA VISUAL</span>
            <h2 className="section-title" style={{ marginTop: '1rem', marginBottom: '1.5rem', fontSize: 'clamp(2rem, 5vw, 4rem)' }}>Fragmentos de la Ciénaga</h2>
            <p style={{ fontSize: '1.3rem', opacity: 0.6, maxWidth: '700px', margin: '0 auto', fontWeight: 300 }}>Una inmersión visual en el universo que Alejo descubre entre los árboles y el agua.</p>
          </div>

          <div className="stories-layout" style={{ display: 'flex', flexDirection: 'column', gap: '12rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2rem', alignItems: 'center' }}>
              <div style={{ gridColumn: '1 / 9', position: 'relative' }}>
                <img src={photos[0]} alt="Jarupia 1" style={{ width: '100%', borderRadius: '4px' }} />
                <div style={{ position: 'absolute', bottom: '-2rem', right: '-2rem', backgroundColor: 'var(--accent-lime)', padding: '2rem', maxWidth: '300px', borderRadius: '2px' }}>
                  <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-brown)', lineHeight: 1.4 }}>"Allí deberá atravesar desafíos, aprender a escuchar a los elementales del bosque..."</p>
                </div>
              </div>
              <div style={{ gridColumn: '10 / 13' }}>
                <img src={photos[1]} alt="Jarupia 2" style={{ width: '100%', borderRadius: '4px', transform: 'translateY(4rem)' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="jarupia-rewards" style={{ padding: '10rem 0', backgroundColor: '#fdfbf7' }}>
        <div className="container">
          <div style={{ marginBottom: '5rem' }}>
            <h2 className="section-title">Opciones de adquisición</h2>
            <p style={{ fontSize: '1.1rem', opacity: 0.7 }}>Elige cómo quieres ser parte de esta historia.</p>
          </div>
          <div className="jarupia-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
            {rewards.map((reward, index) => (
              <div key={index} className="purchase-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '3.5rem 2.5rem', border: '1px solid rgba(92, 74, 51, 0.1)', borderRadius: '4px', backgroundColor: 'white' }}>
                <div>
                  <p className="price" style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-brown)', marginBottom: '1.5rem', fontFamily: 'var(--font-logo)' }}>{reward.price}</p>
                  <p style={{ fontSize: '1.05rem', lineHeight: 1.6, opacity: 0.8 }}>{reward.description}</p>
                </div>
                <a href={`https://wa.me/573042644962?text=Hola! Quiero apoyar la preventa de Jarupia con la recompensa de ${reward.price}`} target="_blank" rel="noopener noreferrer" className="cta-button" style={{ textAlign: 'center', marginTop: '3rem', width: '100%', padding: '1.1rem' }}>
                  Elegir esta opción
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="jarupia-conclusion" style={{ padding: '10rem 0', textAlign: 'center', backgroundColor: 'var(--accent-lime)' }}>
        <div className="container">
          <p className="closure-text" style={{ fontSize: 'clamp(2rem, 6vw, 5rem)', fontWeight: 700, color: 'var(--text-brown)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '3rem' }}>
            La Jarupia existe. <br />Solo tienes que abrir el libro.
          </p>
        </div>
      </section>
    </main>
  )
}
