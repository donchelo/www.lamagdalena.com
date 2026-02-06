import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/atoms/Logo';

const PortfolioPage = () => {
    return (
        <div className="portfolio-page" style={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--bg-cream)',
            backgroundImage: 'var(--bg-paper)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            overflow: 'hidden',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 2000
        }}>
            {/* Header / Back Button */}
            <header style={{
                padding: '1.5rem clamp(1rem, 5vw, 2rem)',
                backgroundColor: 'transparent',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
/* Eliminado text-transform: uppercase */
                    zIndex: 10,
                    borderBottom: '1px solid rgba(92, 74, 51, 0.1)'
                }}>
                    <Link to="/" style={{
                        color: 'var(--text-brown)',
                        textDecoration: 'none',
                        fontFamily: 'var(--font-menu)',
                        fontSize: '0.85rem',
                        letterSpacing: '0.1em',
                        /* Eliminado text-transform: uppercase */
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontWeight: '500'
                    }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Volver
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <Logo variant="07" style={{ height: '30px', filter: 'brightness(0.3)' }} />
                    <div style={{
                        color: 'var(--text-brown)',
                        fontFamily: 'var(--font-logo)',
                        fontSize: '0.9rem',
                        letterSpacing: '0.15em',
                        fontWeight: '700',
                        /* Eliminado text-transform: uppercase */
                    }}>
                        Portfolio
                    </div>
                </div>

                <div style={{ width: '80px' }}></div> {/* Balanced space */}
            </header>

            {/* PDF Viewer Container */}
            <div style={{
                flex: 1,
                width: '100%',
                position: 'relative',
                padding: '1.5rem',
                backgroundColor: 'rgba(0,0,0,0.02)'
            }}>
                <div style={{
                    width: '100%',
                    height: '100%',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    backgroundColor: 'white'
                }}>
                    <iframe
                        src={`${import.meta.env.BASE_URL}portfolio.pdf#toolbar=0&navpanes=0&scrollbar=0`}
                        title="Portafolio La Magdalena"
                        width="100%"
                        height="100%"
                        style={{ border: 'none' }}
                    />
                </div>
            </div>

            <style>
                {`
                    .portfolio-page {
                        animation: fadeIn 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; transform: scale(1.02); }
                        to { opacity: 1; transform: scale(1); }
                    }
                `}
            </style>
        </div>
    );
};

export default PortfolioPage;
