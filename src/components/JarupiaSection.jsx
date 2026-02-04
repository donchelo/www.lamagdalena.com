import React from 'react'
import { Link } from 'react-router-dom'
import Logo from './Logo'

const JarupiaSection = ({ featureImg }) => {
    return (
        <section id="jarupia" className="jarupia-section">
            <div className="container">
                <div className="jarupia-header">
                    <h2 className="section-title">Jarupia</h2>
                    <p>Historias tejidas en productos con sentido.</p>
                </div>
                <div className="jarupia-grid">
                    <div className="product-card featured">
                        <div className="product-image">
                            <img src={featureImg} alt="Jarupia por Chino Romero" />
                            <div className="product-logo-accent">
                                <Logo variant="07" style={{ height: '30px', filter: 'brightness(0) invert(1)' }} />
                            </div>
                            <span className="badge">Destacado</span>
                        </div>
                        <div className="product-info">
                            <h3>Jarupia por Chino Romero</h3>
                            <p className="price">A partir de $170.000,00 COP</p>
                            <Link to="/jarupia-libro">
                                <button className="buy-button">Ver Detalles del Libro</button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default JarupiaSection
