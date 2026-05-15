import Link from 'next/link'
import Hero from '@/components/organisms/Hero'
import BlogCard from '@/components/molecules/BlogCard'
import ServicesSection from '@/components/organisms/ServicesSection'
import ContactSection from '@/components/organisms/ContactSection'
import { storiesData } from '@/data/stories'

const heroImages = [
  '/assets/hero/_DSC3237.webp',
  '/assets/hero/DJI_0178.webp',
  '/assets/hero/DSC00302.webp',
  '/assets/hero/DSC00636.webp',
  '/assets/hero/DSC01976.webp',
  '/assets/hero/DSC03314.webp',
  '/assets/hero/DSC03743.webp',
  '/assets/hero/DSC08047.webp',
  '/assets/hero/DSCF2597.webp',
  '/assets/hero/Rio-Chitamena-2.webp',
  '/assets/hero/_DSC0619.webp',
  '/assets/hero/_DSC1569.webp',
  '/assets/hero/_DSC4413.webp',
  '/assets/hero/_DSC5128.webp',
  '/assets/hero/_DSC5164.webp',
  '/assets/hero/_DSC9052.webp',
  '/assets/hero/_MG_2298.webp',
  '/assets/hero/_MG_2822.webp',
  '/assets/hero/_MG_2848.webp',
]

export default function HomePage() {
  return (
    <main id="inicio">
      <Hero
        subtitle="Convertimos impacto real en narrativas creíbles, visibles y relevantes. Storytelling, audiovisual y consultoría para organizaciones con propósito."
        images={heroImages}
        variant="with-text"
      />

      <section className="blog-section" id="historias" style={{ padding: 'var(--section-padding) 0' }}>
        <div className="container">
          <h2 className="section-title">Historias</h2>
          <div className="blog-grid">
            {storiesData.slice(0, 3).map(story => (
              <BlogCard key={story.id} {...story} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            <Link href="/historias" className="buy-button">VER TODAS LAS HISTORIAS</Link>
          </div>
        </div>
      </section>

      <section id="jarupia" style={{ padding: 'var(--section-padding) 0', backgroundColor: '#0e1a12', color: 'white', overflow: 'hidden' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.5, display: 'block', marginBottom: '1.5rem' }}>Obra literaria</span>
              <h2 style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', lineHeight: 0.9, fontWeight: 700, marginBottom: '2rem' }}>Jarupia</h2>
              <p style={{ fontSize: '1.1rem', lineHeight: 1.7, opacity: 0.75, marginBottom: '1rem' }}>
                El secreto de Ayapel. Una historia que nace en la Ciénaga de Ayapel donde la naturaleza tiene memoria y los territorios le hablan a quienes saben escuchar.
              </p>
              <p style={{ fontSize: '0.95rem', opacity: 0.5, marginBottom: '3rem' }}>
                Chino Romero Hoyos · 188 páginas · Edición limitada 1.000 ejemplares
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <a href="/jarupia/" className="cta-button" style={{ backgroundColor: 'white', color: '#0e1a12', padding: '1rem 2.5rem', fontSize: '0.85rem', borderRadius: '2px', display: 'inline-block' }}>
                  Ver el libro
                </a>
                <a
                  href="https://wa.me/573042464962?text=Hola%2C%20me%20interesa%20el%20libro%20Jarupia%20%E2%80%94%20El%20secreto%20de%20Ayapel.%20%C2%BFTienen%20disponibilidad%3F"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ backgroundColor: '#25D366', color: 'white', padding: '1rem 2.5rem', fontSize: '0.85rem', borderRadius: '2px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Pedir por WhatsApp
                </a>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <img src="/assets/photos/jarupia/image-1.webp" alt="Jarupia" style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', borderRadius: '4px' }} />
              <img src="/assets/photos/jarupia/image-2.webp" alt="Jarupia" style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', borderRadius: '4px', marginTop: '3rem' }} />
            </div>
          </div>
        </div>
      </section>

      <ServicesSection />
      <ContactSection />
    </main>
  )
}
