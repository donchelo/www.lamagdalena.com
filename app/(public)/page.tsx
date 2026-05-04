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

      <ServicesSection />
      <ContactSection />
    </main>
  )
}
