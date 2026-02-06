import React from 'react'
import Logo from './Logo'

const ServicesSection = () => {
    return (
        <section id="servicios" className="services-section">
            <div className="container">
                <span className="services-label">NUESTROS SERVICIOS</span>
            </div>

            <div className="services-ticker">
                <div className="ticker-track">
                    <h2 className="services-giant-title">COMUNICACIÓN PARA EL IMPACTO REAL / COMUNICACIÓN PARA EL IMPACTO REAL / COMUNICACIÓN PARA EL IMPACTO REAL / </h2>
                    <h2 className="services-giant-title">COMUNICACIÓN PARA EL IMPACTO REAL / COMUNICACIÓN PARA EL IMPACTO REAL / COMUNICACIÓN PARA EL IMPACTO REAL / </h2>
                </div>
            </div>
            
            <div className="container">
                <div className="services-grid">
                    <div className="service-card">
                        <div className="service-content">
                            <h3>Storytelling</h3>
                            <p className="service-lead">Diseñamos narrativas que conectan propósito, emoción y acción desde lo humano.</p>
                            <p>Partimos de las personas, quienes hacen, reciben y transforman los proyectos para convertir ideas, procesos e impactos reales en historias relevantes.</p>
                        </div>
                    </div>

                    <div className="service-card">
                        <div className="service-content">
                            <h3>Producción audiovisual</h3>
                            <p className="service-lead">Damos vida a las historias a través de fotografía, video y texto.</p>
                            <p>Creamos piezas audiovisuales alineadas con objetivos claros de comunicación. Adaptamos formatos y lenguajes según la audiencia, el canal y el contexto.</p>
                        </div>
                    </div>

                    <div className="service-card">
                        <div className="service-content">
                            <h3>Consultoria</h3>
                            <p className="service-lead">Acompañamos a organizaciones en el diseño de estrategias de impacto positivo.</p>
                            <p>Pensamos desde lo que se hace hasta cómo se cuenta, asegurando coherencia entre acción y relato.</p>
                        </div>
                    </div>

                    <div className="service-card">
                        <div className="service-content">
                            <h3>Talleres</h3>
                            <p className="service-lead">Hoy las organizaciones hacen cosas importantes, pero sus equipos no siempre saben cómo contarlas.</p>
                            <p>Nuestros talleres fortalecen la capacidad de los equipos para contar historias claras, humanas y estratégicas, aplicables a su trabajo diario.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ServicesSection
