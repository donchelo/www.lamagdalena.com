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

      <section id="jarupia" style={{ padding: 'var(--section-padding) 0', backgroundColor: '#f6f5f1', color: '#59345f', overflow: 'hidden' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
            <div>
              <p style={{ fontFamily: "'Neue Haas Display', sans-serif", fontWeight: 500, fontSize: '0.8rem', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                Chino Romero Hoyos
              </p>
              <h2 style={{ fontFamily: "'Neue Haas Display', sans-serif", fontWeight: 900, fontSize: 'clamp(3rem, 7vw, 5.5rem)', lineHeight: 0.92, marginBottom: '2rem' }}>
                Jarupia
              </h2>
              <p style={{ fontFamily: "'Helvetica Neue Light', sans-serif", fontSize: '1.1rem', lineHeight: 1.7, maxWidth: '32rem', marginBottom: '2.5rem' }}>
                Es un fotolibro ficcionado que está inspirado en la ciénaga de Ayapel, las historias de los pescadores y pobladores alimentaron los mundos posibles de sus aguas.
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <a
                  href="https://wa.me/573042464962?text=Hola%2C%20quiero%20adquirir%20un%20ejemplar%20de%20Jarupia%3A%20El%20secreto%20de%20Ayapel."
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontFamily: "'Neue Haas Display', sans-serif", fontWeight: 500, fontSize: '0.85rem', letterSpacing: '0.04em', textTransform: 'uppercase', backgroundColor: '#59345f', color: '#fff', border: '1px solid #59345f', padding: '1.05rem 2.25rem', borderRadius: '2px', display: 'inline-block' }}
                >
                  Conseguir el libro
                </a>
                <Link
                  href="/jarupia"
                  style={{ fontFamily: "'Neue Haas Display', sans-serif", fontWeight: 500, fontSize: '0.85rem', letterSpacing: '0.04em', textTransform: 'uppercase', backgroundColor: 'transparent', color: '#59345f', border: '1px solid #59345f', padding: '1.05rem 2.25rem', borderRadius: '2px', display: 'inline-block' }}
                >
                  Explorar la historia
                </Link>
              </div>
            </div>
            <div>
              <img src="/jarupia/assets/redesign/hero-book.webp" alt="Portada del libro Jarupia — El secreto de Ayapel" style={{ width: '100%', height: 'auto', borderRadius: '3px' }} />
            </div>
          </div>
        </div>
      </section>

      <ServicesSection />
      <ContactSection />
    </main>
  )
}
