import React from 'react'
import Logo from '../atoms/Logo'
import Heading from '../atoms/Heading'
import Text from '../atoms/Text'

const ServicesSection = () => {
    return (
        <section id="servicios" className="services-section">
            <div className="container">
                <Text as="span" className="services-label">Nuestros servicios</Text>
            </div>

            <div className="services-ticker">
                <div className="ticker-track">
                    <Heading level={2} className="services-giant-title">Comunicación para el impacto real / Comunicación para el impacto real / Comunicación para el impacto real / </Heading>
                    <Heading level={2} className="services-giant-title">Comunicación para el impacto real / Comunicación para el impacto real / Comunicación para el impacto real / </Heading>
                </div>
            </div>
            
            <div className="container">
                <div className="services-grid">
                    <div className="service-card">
                        <div className="service-content">
                            <Heading level={3}>Storytelling</Heading>
                            <Text className="service-lead">Diseñamos narrativas que conectan propósito, emoción y acción desde lo humano.</Text>
                            <Text>Partimos de las personas, quienes hacen, reciben y transforman los proyectos para convertir ideas, procesos e impactos reales en historias relevantes.</Text>
                        </div>
                    </div>

                    <div className="service-card">
                        <div className="service-content">
                            <Heading level={3}>Producción audiovisual</Heading>
                            <Text className="service-lead">Damos vida a las historias a través de fotografía, video y texto.</Text>
                            <Text>Creamos piezas audiovisuales alineadas con objetivos claros de comunicación. Adaptamos formatos y lenguajes según la audiencia, el canal y el contexto.</Text>
                        </div>
                    </div>

                    <div className="service-card">
                        <div className="service-content">
                            <Heading level={3}>Consultoria</Heading>
                            <Text className="service-lead">Acompañamos a organizaciones en el diseño de estrategias de impacto positivo.</Text>
                            <Text>Pensamos desde lo que se hace hasta cómo se cuenta, asegurando coherencia entre acción y relato.</Text>
                        </div>
                    </div>

                    <div className="service-card">
                        <div className="service-content">
                            <Heading level={3}>Talleres</Heading>
                            <Text className="service-lead">Hoy las organizaciones hacen cosas importantes, pero sus equipos no siempre saben cómo contarlas.</Text>
                            <Text>Nuestros talleres fortalecen la capacidad de los equipos para contar historias claras, humanas y estratégicas, aplicables a su trabajo diario.</Text>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ServicesSection
