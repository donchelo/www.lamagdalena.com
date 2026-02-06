import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import MainLayout from '../components/templates/MainLayout'
import img1 from '../assets/photos/jarupia/image-1.webp'
import img2 from '../assets/photos/jarupia/image-2.webp'
import img3 from '../assets/photos/jarupia/image-3.webp'
import img4 from '../assets/photos/jarupia/image-4.webp'
import img5 from '../assets/photos/jarupia/image-5.webp'

const JarupiaPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return (
        <MainLayout>
            <main className="jarupia-page">
                <section className="jarupia-hero">
                    <div className="container">
                        <Link to="/" className="back-link">← Volver al inicio</Link>
                        <div className="jarupia-hero-content">
                            <h1 className="section-title">Jarupia</h1>
                            <p className="lead">El secreto de Ayapel</p>
                        </div>
                    </div>
                </section>

                <section className="jarupia-details">
                    <div className="container">
                        <div className="details-grid">
                            <div className="details-image-main">
                                <img src={img2} alt="Portada Jarupia" />
                            </div>
                            <div className="details-text">
                                <h2>Una historia tejida en el territorio</h2>
                                
                                <div style={{ marginTop: '2rem' }}>
                                    <p style={{ marginBottom: '2rem' }}>
                                        <span className="case-study-label">Reto:</span> 
                                        Capturar la esencia mística y la fragilidad ambiental de la Ciénaga de Ayapel en una narrativa que resuene con niños y adultos por igual.
                                    </p>
                                    
                                    <p style={{ marginBottom: '2rem' }}>
                                        <span className="case-study-label">Solución:</span> 
                                        La creación de "Jarupia", una obra literaria donde la realidad y la fantasía se encuentran. Escrito por Chino Romero e ilustrado por Samuel Castaño, esta obra nos invita a reconectar con la naturaleza y sus guardianes.
                                    </p>
                                    
                                    <p style={{ marginBottom: '2rem' }}>
                                        <span className="case-study-label">Resultados:</span> 
                                        Un viaje sensorial a través del territorio, una herramienta pedagógica para la conservación y un objeto de arte coleccionable.
                                    </p>
                                </div>

                                <div className="spec-box">
                                    <p><span className="case-study-label" style={{ fontSize: '0.75rem' }}>Autor:</span> Chino Romero (Andrés Camilo Romero Hoyos)</p>
                                    <p><span className="case-study-label" style={{ fontSize: '0.75rem' }}>Ilustraciones:</span> Samuel Castaño</p>
                                    <p><span className="case-study-label" style={{ fontSize: '0.75rem' }}>Lanzamiento:</span> 2025</p>
                                    <p><span className="case-study-label" style={{ fontSize: '0.75rem' }}>Isbn:</span> 978-628-019523-0</p>
                                </div>

                                <div className="purchase-card">
                                    <h3>Adquiere tu ejemplar</h3>
                                    <p className="price">$170.000,00 COP</p>
                                    <p className="description">Incluye firma del autor y una colección de postales originales.</p>
                                    <a href="https://wa.me/573042644962" target="_blank" rel="noopener noreferrer" className="cta-button">
                                        Comprar por WhatsApp
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="jarupia-gallery">
                    <div className="container">
                        <h2 className="section-title">El mundo de Jarupia</h2>
                        <div className="inner-gallery">
                            <div className="gallery-column">
                                <img src={img1} alt="Jarupia detalle 1" />
                                <img src={img3} alt="Jarupia detalle 3" />
                            </div>
                            <div className="gallery-column">
                                <img src={img4} alt="Jarupia detalle 4" />
                                <img src={img5} alt="Jarupia detalle 5" />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="jarupia-conclusion">
                    <div className="container">
                        <p className="closure-text">Una oda a la ciénaga y sus misterios.</p>
                    </div>
                </section>
            </main>
        </MainLayout>
    )
}

export default JarupiaPage
