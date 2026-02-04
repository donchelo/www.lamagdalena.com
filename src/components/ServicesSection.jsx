import React from 'react'
import Logo from './Logo'

const ServicesSection = ({ storytellingImg, audiovisualImg, consultancyImg }) => {
    return (
        <section id="servicios" className="services-section">
            <div className="container">
                <h2 className="section-title">Qué hacemos</h2>
                <p className="services-intro">
                    En La Magdalena ponemos a las personas en el centro de las historias.
                    Trabajamos con organizaciones que entienden que el impacto no solo se mide, también se comunica —con honestidad y sensibilidad.
                </p>

                <div className="services-grid">
                    <div className="service-card">
                        <div className="service-image">
                            <img src={storytellingImg} alt="Storytelling" />
                        </div>
                        <div className="service-content">
                            <h3><span className="case-study-label">ESTRATEGIA:</span> Storytelling</h3>
                            <p className="service-tagline">Contar para conectar</p>
                            <p>Diseñamos narrativas que nacen de la vida cotidiana: en organizaciones, ciudades, culturas y territorios. Historias que conectan propósito, emoción y acción.</p>
                        </div>
                    </div>

                    <div className="service-card reversed">
                        <div className="service-content">
                            <h3>Audiovisual</h3>
                            <p className="service-tagline">Audiovisual que da vida a las historias</p>
                            <p>Creamos fotografía, video y contenido narrativo que amplifica historias reales en los formatos adecuados para cada audiencia. Cada pieza tiene un propósito claro y una intención definida.</p>
                        </div>
                        <div className="service-image">
                            <img src={audiovisualImg} alt="Audiovisual" />
                        </div>
                    </div>

                    <div className="service-card">
                        <div className="service-image">
                            <img src={consultancyImg} alt="Consultoría" />
                        </div>
                        <div className="service-content">
                            <h3><span className="case-study-label">ACOMPAÑAMIENTO:</span> Consultoría</h3>
                            <p className="service-tagline">Pensar para impactar</p>
                            <p>Acompañamos procesos estratégicos para alinear impacto, propósito y comunicación. Pensamos qué se hace, cómo se hace y cómo se cuenta.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ServicesSection
