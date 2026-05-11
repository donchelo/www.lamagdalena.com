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
              <a href="/jarupia/" className="cta-button" style={{ backgroundColor: 'white', color: '#0e1a12', padding: '1rem 2.5rem', fontSize: '0.85rem', borderRadius: '2px', display: 'inline-block' }}>
                Ver el libro
              </a>
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
