import React from 'react'

const ContactSection = () => {
    return (
        <section id="contacto" className="contact-main-section">
            <div className="container">
                <div className="contact-grid">
                    <div className="contact-content">
                        <h2 className="section-title">Hablemos</h2>
                        <p className="lead">¿Tienes una historia que necesita ser contada? ¿Quieres que trabajemos juntos para visibilizar el impacto de tu organización?</p>
                        <p>Estamos listos para escucharte y explorar nuevas formas de conectar a través del territorio y la vida.</p>
                        
                        <div className="contact-methods">
                            <div className="method-item">
                                <h3>Email</h3>
                                <a href="mailto:chino@lamagdalena.com.co" className="method-link">chino@lamagdalena.com.co</a>
                            </div>
                            <div className="method-item">
                                <h3>Teléfono</h3>
                                <a href="tel:+573042644962" className="method-link">+57 304 264 4962</a>
                            </div>
                            <div className="method-item">
                                <h3>Instagram</h3>
                                <a href="https://www.instagram.com/lamagdalena___" target="_blank" rel="noopener noreferrer" className="method-link">@lamagdalena___</a>
                            </div>
                        </div>
                    </div>
                    
                    <div className="contact-extra">
                        <div className="location-info">
                            <h3>Colombia</h3>
                            <p>Explorando el territorio desde las selvas hasta las ciudades.</p>
                        </div>
                        <div className="closure-minimal">
                            <p className="highlight-text">Contamos lo que vemos.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ContactSection
