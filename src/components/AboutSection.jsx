import React from 'react'
import Logo from './Logo'

const AboutSection = ({ profileImg }) => {
    return (
        <section id="nosotros" className="about-section">
            <div className="container">
                <div className="about-grid">
                    <div className="about-text">
                        <h2 className="section-title">Nosotros</h2>
                        <p className="lead">Un estudio de storytelling de impacto, inspirado por el territorio.</p>
                        <p>Desde 2015, nuestros viajes por Colombia nos han acercado a personas y lugares que trabajan por los cambios urgentes que necesita el mundo. De esas experiencias nació La Magdalena: un estudio que crea y acompaña narrativas sobre acciones que mejoran las condiciones de vida, el entorno y las relaciones humanas.</p>
                        <p>Hemos contado historias desde selvas, ciénagas y montañas junto a expediciones como Colombia Bio del Instituto Humboldt, y hemos acompañado a organizaciones como Bancolombia, ISA, Presentes, Comfama, Argos, ProColombia, entre otras, a visibilizar sus apuestas de impacto.</p>
                        <p className="highlight-text">Contamos lo que vemos, y ayudamos a otros a contar lo que hacen.</p>
                    </div>
                    <div className="about-profile">
                        <div className="profile-card">
                            <div className="profile-image">
                                <img src={profileImg} alt="Chino Romero" />
                            </div>
                            <div className="profile-info">
                                <h3>Chino Romero</h3>
                                <p className="role">Director de La Magdalena</p>
                                <p className="description">Soy Chino Romero, contador de historias, fotógrafo y explorador de Colombia. Hace unos años dejé mi trabajo para dedicarme al storytelling de impacto, creando narrativas que conectan a las personas con el territorio y la vida.</p>
                                <p className="description">Empecé La Magdalena, con la idea de acompañar a las organizaciones a amplificar su mensaje e inspirar cambios a través de estrategias de comunicación y contenido de valor.</p>
                                <p className="books">Coautor de los libros: El Darién, El libro de la calidez / marca país, y Peces Geólogicos.</p>
                                
                                <div className="profile-contact">
                                    <a href="mailto:chino@lamagdalena.com.co" className="contact-link">chino@lamagdalena.com.co</a>
                                    <a href="tel:+573042644962" className="contact-link">+57 304 264 4962</a>
                                    <a href="https://www.instagram.com/lamagdalena___" target="_blank" rel="noopener noreferrer" className="contact-link">@lamagdalena___</a>
                                </div>

                                <div className="profile-signature" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-start' }}>
                                    <Logo variant="07" style={{ height: '32px', opacity: 0.7 }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default AboutSection
