import React from 'react'
import { Link } from 'react-router-dom'
import MainLayout from '../components/templates/MainLayout'
import Hero from '../components/organisms/Hero'
import ContentGrid, { GridItem } from '../components/organisms/ContentGrid'
import ProductCard from '../components/molecules/ProductCard'
import AboutSection from '../components/organisms/AboutSection'
import ServicesSection from '../components/organisms/ServicesSection'
import ContactSection from '../components/organisms/ContactSection'
import { products } from '../data/products'

import hero1 from '../assets/hero/DJI_0178.jpg'
import hero2 from '../assets/hero/DSC00302.jpg'
import hero3 from '../assets/hero/DSC00636.jpg'
import hero4 from '../assets/hero/DSC01976.jpg'
import hero5 from '../assets/hero/DSC03314.jpg'
import hero6 from '../assets/hero/DSC03743.jpg'
import hero7 from '../assets/hero/DSC08047.jpg'
import hero8 from '../assets/hero/DSCF2597.jpg'
import hero10 from '../assets/hero/Rio-Chitamena-2.jpg'
import hero11 from '../assets/hero/_DSC0619.jpg'
import hero12 from '../assets/hero/_DSC1569.jpg'
import hero13 from '../assets/hero/_DSC3237.jpg'
import hero14 from '../assets/hero/_DSC4413.jpg'
import hero15 from '../assets/hero/_DSC5128.jpg'
import hero16 from '../assets/hero/_DSC5164.jpg'
import hero17 from '../assets/hero/_DSC9052.jpg'
import hero18 from '../assets/hero/_MG_2298.jpg'
import hero19 from '../assets/hero/_MG_2822.jpg'
import hero20 from '../assets/hero/_MG_2848.jpg'
import content1 from '../assets/photos/content-1.jpg'

const HomePage = () => {
    return (
        <MainLayout>
            <main id="inicio">
                <Hero
                    subtitle="Convertimos impacto real en narrativas creíbles, visibles y relevantes. Storytelling, audiovisual y consultoría para organizaciones con propósito."
                    images={[
                        hero1, hero2, hero3, hero4, hero5,
                        hero6, hero7, hero8, hero10,
                        hero11, hero12, hero13, hero14, hero15,
                        hero16, hero17, hero18, hero19, hero20
                    ]}
                    variant="with-text"
                />

                <ContentGrid>
                    <GridItem
                        imageUrl={content1}
                    />
                    <GridItem
                        type="text"
                        text={`En La Magdalena ponemos a las personas en el centro de las historias. Trabajamos con organizaciones que entienden que el impacto no solo se mide, también se comunica —con honestidad y sensibilidad.`}
                    />
                </ContentGrid>

                <AboutSection />

                <ServicesSection />

                <section className="differentiator-section">
                    <div className="container">
                        <div className="differentiator-box">
                            <h2>No hacemos greenwashing</h2>
                            <p>Creemos en la comunicación honesta, basada en acciones reales y en las personas que las viven.</p>
                        </div>
                    </div>
                </section>

                <section className="shop-preview-section" id="galeria" style={{ padding: 'var(--section-padding) 0', backgroundColor: 'white' }}>
                    <div className="container">
                        <h2 className="section-title">Galería</h2>
                        <div className="products-grid-commercial">
                            {products.slice(0, 6).map(product => (
                                <ProductCard key={product.id} product={product} showPrice={false} />
                            ))}
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                            <Link to="/shop" className="buy-button">VER TODOS LOS PRINTS</Link>
                        </div>
                    </div>
                </section>

                <ContactSection />
            </main>
        </MainLayout>
    )
}

export default HomePage
