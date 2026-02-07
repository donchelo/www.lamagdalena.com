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

import hero1 from '../assets/photos/hero-1.jpg'
import hero2 from '../assets/photos/hero-2.jpg'
import content1 from '../assets/photos/content-1.jpg'

const HomePage = () => {
    return (
        <MainLayout>
            <main id="inicio">
                <Hero
                    subtitle="Convertimos impacto real en narrativas creíbles, visibles y relevantes. Storytelling, audiovisual y consultoría para organizaciones con propósito."
                    images={[hero1, hero2, ...products.slice(0, 5).map(p => p.image)]}
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
