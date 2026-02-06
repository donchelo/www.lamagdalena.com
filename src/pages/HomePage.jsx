import React from 'react'
import Hero from '../components/Hero'
import ContentGrid, { GridItem } from '../components/ContentGrid'
import Gallery from '../components/Gallery'
import AboutSection from '../components/AboutSection'
import ServicesSection from '../components/ServicesSection'
import JarupiaSection from '../components/JarupiaSection'
import ContactSection from '../components/ContactSection'

import hero1 from '../assets/photos/hero-1.jpg'
import hero2 from '../assets/photos/hero-2.jpg'
import content1 from '../assets/photos/content-1.jpg'
import serviceStorytelling from '../assets/photos/service-storytelling.jpg'
import serviceAudiovisual from '../assets/photos/service-audiovisual.jpg'
import serviceConsultancy from '../assets/photos/service-consultancy.jpg'
import profileImg from '../assets/photos/chino-profile.jpg'
import jarupiaImg from '../assets/photos/jarupia-real.webp'
import gallery1 from '../assets/photos/gallery-1.jpg'
import gallery2 from '../assets/photos/gallery-2.jpg'
import gallery3 from '../assets/photos/gallery-3.jpg'
import gallery4 from '../assets/photos/gallery-4.jpg'
import gallery5 from '../assets/photos/gallery-5.jpg'
import gallery6 from '../assets/photos/gallery-6.jpg'
import illustration01 from '../assets/illustration-01.png'

const HomePage = () => {
    return (
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

            <AboutSection profileImg={profileImg} />

            <ServicesSection
                storytellingImg={serviceStorytelling}
                audiovisualImg={serviceAudiovisual}
                consultancyImg={serviceConsultancy}
            />

            <section className="differentiator-section">
                <div className="container">
                    <div className="differentiator-box">
                        <h2>No hacemos greenwashing.</h2>
                        <p>Creemos en la comunicación honesta, basada en acciones reales y en las personas que las viven.</p>
                    </div>
                </div>
            </section>

            <JarupiaSection featureImg={jarupiaImg} />

            <div id="historias">
                <Gallery photos={[gallery1, gallery2, gallery3, gallery4, gallery5, gallery6]} />
            </div>

            <ContactSection />

            <section className="brand-decoration">
                <div className="container">
                    <img src={illustration01} alt="Decoration" className="illustration-main" />
                </div>
            </section>
        </main>
    )
}

export default HomePage
