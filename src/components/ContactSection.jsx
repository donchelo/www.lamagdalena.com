import React from 'react'

const ContactSection = () => {
    return (
        <section id="contacto" className="contact-main-section">
            <div className="container">
                <div className="contact-grid">
                    <div className="contact-info-side">
                        <h2 className="section-title">Contemos historias</h2>
                        
                        <div className="contact-methods-vertical">
                            <div className="method-item">
                                <span className="method-label">Email</span>
                                <a href="mailto:chino@lamagdalena.com.co" className="method-link">chino@lamagdalena.com.co</a>
                            </div>
                            <div className="method-item">
                                <span className="method-label">Teléfono</span>
                                <a href="tel:+573042644962" className="method-link">+57 304 264 4962</a>
                            </div>
                            <div className="method-item">
                                <span className="method-label">Instagram</span>
                                <a href="https://www.instagram.com/lamagdalena___" target="_blank" rel="noopener noreferrer" className="method-link">@lamagdalena___</a>
                            </div>
                        </div>
                    </div>
                    
                    <div className="contact-form-side">
                        <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
                            <div className="form-group">
                                <label htmlFor="email">*email</label>
                                <input type="email" id="email" name="email" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="subject">*asunto</label>
                                <input type="text" id="subject" name="subject" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="message">*mensaje</label>
                                <textarea id="message" name="message" rows="4" required></textarea>
                            </div>
                            <button type="submit" className="submit-btn">Enviar</button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ContactSection
