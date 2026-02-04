import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
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
                            <p>Jarupia no es solo un libro; es un viaje a través de la Ciénaga de Ayapel, donde la realidad y la fantasía se encuentran. Escrito por Chino Romero e ilustrado por Samuel Castaño, esta obra nos invita a reconectar con la naturaleza y sus guardianes.</p>

                            <div className="spec-box">
                                <p><strong>Autor:</strong> Chino Romero (Andrés Camilo Romero Hoyos)</p>
                                <p><strong>Ilustraciones:</strong> Samuel Castaño</p>
                                <p><strong>Lanzamiento:</strong> 2025</p>
                                <p><strong>ISBN:</strong> 978-628-019523-0</p>
                            </div>

                            <div className="purchase-card">
                                <h3>Adquiere tu ejemplar</h3>
                                <p className="price">$170.000,00 COP</p>
                                <p className="description">Incluye firma del autor y una colección de postales originales.</p>
                                <a href="https://wa.me/573000000000" target="_blank" rel="noopener noreferrer" className="cta-button">
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
                <div className="container text-center">
                    <p className="closure-text">Una oda a la ciénaga y sus misterios.</p>
                </div>
            </section>
        </main>
    )
}

export default JarupiaPage
