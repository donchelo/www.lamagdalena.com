import React, { useState } from 'react'
import Heading from '../atoms/Heading'
import Text from '../atoms/Text'
import Input from '../atoms/Input'
import Button from '../atoms/Button'

const ContactSection = () => {
    const [formData, setFormData] = useState({
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');

        // Usar variable de entorno para el ID de Formspree
        // Si no está definida, usaremos 'x' como fallback (error controlado)
        const FORMSPREE_ID = import.meta.env.VITE_FORMSPREE_ID || 'x';
        const endpoint = `https://formspree.io/f/${FORMSPREE_ID}`;

        try {
            if (FORMSPREE_ID === 'x') {
                throw new Error('Formspree ID no configurado. Por favor, configura VITE_FORMSPREE_ID.');
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setStatus('success');
                setFormData({ email: '', subject: '', message: '' });
            } else {
                const data = await response.json();
                console.error('Submission error response:', data);
                throw new Error('Submission failed');
            }
        } catch (error) {
            console.error('Submission error:', error.message || error);
            setStatus('error');
        }
    };

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
                        {status === 'success' ? (
                            <div className="success-message" style={{ padding: '2rem', border: '1px solid var(--accent-light)', borderRadius: '8px', textAlign: 'center' }}>
                                <Heading level={3}>¡Gracias!</Heading>
                                <Text>Tu historia es importante. Nos pondremos en contacto contigo pronto.</Text>
                                <Button onClick={() => setStatus('idle')} style={{ marginTop: '1rem' }}>Enviar otro mensaje</Button>
                            </div>
                        ) : (
                            <form className="contact-form" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="email">*email</label>
                                    <Input
                                        type="email"
                                        id="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={status === 'submitting'}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="subject">*asunto</label>
                                    <Input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        required
                                        value={formData.subject}
                                        onChange={handleChange}
                                        disabled={status === 'submitting'}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="message">*mensaje</label>
                                    <Input
                                        as="textarea"
                                        id="message"
                                        name="message"
                                        rows="4"
                                        required
                                        value={formData.message}
                                        onChange={handleChange}
                                        disabled={status === 'submitting'}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    variant="submit"
                                    id="submit-button"
                                    disabled={status === 'submitting'}
                                >
                                    {status === 'submitting' ? 'Enviando...' : 'Enviar'}
                                </Button>
                                {status === 'error' && (
                                    <Text className="error-text" style={{ color: 'red', marginTop: '1rem' }}>
                                        Hubo un error al enviar el formulario. Por favor, intenta de nuevo.
                                    </Text>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ContactSection
