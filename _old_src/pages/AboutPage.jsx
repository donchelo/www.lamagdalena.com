import React, { useEffect } from 'react'
import MainLayout from '../components/templates/MainLayout'
import AboutHero from '../components/organisms/AboutHero'
import AboutSection from '../components/organisms/AboutSection'

const AboutPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return (
        <MainLayout>
            <main className="about-page">
                <AboutHero />
                <AboutSection />
            </main>
        </MainLayout>
    )
}

export default AboutPage
