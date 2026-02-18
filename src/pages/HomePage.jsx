import React from 'react'
import { Link } from 'react-router-dom'
import MainLayout from '../components/templates/MainLayout'
import Hero from '../components/organisms/Hero'
import BlogCard from '../components/molecules/BlogCard'
import ServicesSection from '../components/organisms/ServicesSection'
import ContactSection from '../components/organisms/ContactSection'
import { storiesData } from '../data/stories'

import hero1 from '../assets/hero/DJI_0178.webp'
import hero2 from '../assets/hero/DSC00302.webp'
import hero3 from '../assets/hero/DSC00636.webp'
import hero4 from '../assets/hero/DSC01976.webp'
import hero5 from '../assets/hero/DSC03314.webp'
import hero6 from '../assets/hero/DSC03743.webp'
import hero7 from '../assets/hero/DSC08047.webp'
import hero8 from '../assets/hero/DSCF2597.webp'
import hero10 from '../assets/hero/Rio-Chitamena-2.webp'
import hero11 from '../assets/hero/_DSC0619.webp'
import hero12 from '../assets/hero/_DSC1569.webp'
import hero13 from '../assets/hero/_DSC3237.webp'
import hero14 from '../assets/hero/_DSC4413.webp'
import hero15 from '../assets/hero/_DSC5128.webp'
import hero16 from '../assets/hero/_DSC5164.webp'
import hero17 from '../assets/hero/_DSC9052.webp'
import hero18 from '../assets/hero/_MG_2298.webp'
import hero19 from '../assets/hero/_MG_2822.webp'
import hero20 from '../assets/hero/_MG_2848.webp'


const HomePage = () => {
    return (
        <MainLayout>
            <main id="inicio">
                <Hero
                    subtitle="Convertimos impacto real en narrativas creíbles, visibles y relevantes. Storytelling, audiovisual y consultoría para organizaciones con propósito."
                    images={[
                        hero13, hero1, hero2, hero3, hero4, hero5,
                        hero6, hero7, hero8, hero10,
                        hero11, hero12, hero14, hero15,
                        hero16, hero17, hero18, hero19, hero20
                    ]}
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
                            <Link to="/historias" className="buy-button">VER TODAS LAS HISTORIAS</Link>
                        </div>
                    </div>
                </section>



                <ServicesSection />

                <ContactSection />
            </main>
        </MainLayout>
    )
}

export default HomePage
