import Heading from '@/components/atoms/Heading'

export default function AboutHero() {
  return (
    <section className="about-hero">
      <div className="about-hero-image">
        <img src="/assets/hero/_DSC5128.webp" alt="La Magdalena - Somos" />
        <div className="about-hero-overlay"></div>
      </div>
      <div className="about-hero-container container">
        <div className="about-hero-content">
          <Heading level={1} className="about-hero-title">Somos</Heading>
          <a href="#somos-content" className="about-hero-scroll">
            Descubre más
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="7" x2="17" y2="17"></line>
              <polyline points="17 7 17 17 7 17"></polyline>
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
