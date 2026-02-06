import React from 'react'
import MainLayout from '../components/templates/MainLayout'
import Hero from '../components/organisms/Hero'
import ContentGrid, { GridItem } from '../components/organisms/ContentGrid'
import Gallery from '../components/organisms/Gallery'
import AboutSection from '../components/organisms/AboutSection'
import ServicesSection from '../components/organisms/ServicesSection'
import ContactSection from '../components/organisms/ContactSection'

import hero1 from '../assets/photos/hero-1.jpg'
import hero2 from '../assets/photos/hero-2.jpg'
import content1 from '../assets/photos/content-1.jpg'
import gallery1 from '../assets/photos/gallery-1.jpg'
import gallery2 from '../assets/photos/gallery-2.jpg'
import gallery3 from '../assets/photos/gallery-3.jpg'
import gallery4 from '../assets/photos/gallery-4.jpg'
import gallery5 from '../assets/photos/gallery-5.jpg'
import gallery6 from '../assets/photos/gallery-6.jpg'

const HomePage = () => {
    return (
        <MainLayout>
            <main id="inicio">
                <Hero
                    subtitle="Convertimos impacto real en narrativas creíbles, visibles y relevantes. Storytelling, audiovisual y consultoría para organizaciones con propósito."
                    images={[hero1, hero2, gallery1, gallery2, gallery3, gallery4, gallery5]}
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
                            <h2>No hacemos greenwashing.</h2>
                            <p>Creemos en la comunicación honesta, basada en acciones reales y en las personas que las viven.</p>
                        </div>
                    </div>
                </section>

                <div id="historias">
                    <Gallery photos={[gallery1, gallery2, gallery3, gallery4, gallery5, gallery6]} />
                </div>

                <ContactSection />
            </main>
        </MainLayout>
    )
}

export default HomePage
