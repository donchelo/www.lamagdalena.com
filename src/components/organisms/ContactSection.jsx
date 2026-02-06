import React from 'react'
import Heading from '../atoms/Heading'
import Text from '../atoms/Text'
import Input from '../atoms/Input'
import Button from '../atoms/Button'

const ContactSection = () => {
    return (
        <section id="contacto" className="contact-main-section">
            <div className="container">
                <div className="contact-grid">
                    <div className="contact-info-side">
                        <Heading level={2} className="section-title">Contemos historias</Heading>
                        
                        <div className="contact-methods-vertical">
                            <div className="method-item">
                                <Text as="span" className="method-label">Email</Text>
                                <a href="mailto:chino@lamagdalena.com.co" className="method-link">chino@lamagdalena.com.co</a>
                            </div>
                            <div className="method-item">
                                <Text as="span" className="method-label">Teléfono</Text>
                                <a href="tel:+573042644962" className="method-link">+57 304 264 4962</a>
                            </div>
                            <div className="method-item">
                                <Text as="span" className="method-label">Instagram</Text>
                                <a href="https://www.instagram.com/lamagdalena___" target="_blank" rel="noopener noreferrer" className="method-link">@lamagdalena___</a>
                            </div>
                        </div>
                    </div>
                    
                    <div className="contact-form-side">
                        <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
                            <div className="form-group">
                                <label htmlFor="email">*email</label>
                                <Input type="email" id="email" name="email" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="subject">*asunto</label>
                                <Input type="text" id="subject" name="subject" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="message">*mensaje</label>
                                <Input as="textarea" id="message" name="message" rows="4" required />
                            </div>
                            <Button type="submit" variant="submit">Enviar</Button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ContactSection
