import React from 'react';
import { Link } from 'react-router-dom';

const PortfolioPage = () => {
    return (
        <div className="portfolio-page" style={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#1a1a1a',
            overflow: 'hidden',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 2000
        }}>
            {/* Header / Back Button */}
            <div style={{
                padding: '15px 30px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                zIndex: 10
            }}>
                <Link to="/" style={{
                    color: 'white',
                    textDecoration: 'none',
                    fontFamily: 'var(--font-menu)',
                    fontSize: '0.8rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    VOLVER AL INICIO
                </Link>
                <div style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontFamily: 'var(--font-logo)',
                    fontSize: '1rem',
                    letterSpacing: '0.2em'
                }}>
                    PORTAFOLIO LA MAGDALENA
                </div>
                <div style={{ width: '120px' }}></div> {/* Spacer for balance */}
            </div>

            {/* PDF Viewer Container */}
            <div style={{ flex: 1, width: '100%', position: 'relative' }}>
                <iframe
                    src={`${import.meta.env.BASE_URL}portfolio.pdf#toolbar=0&navpanes=0&scrollbar=0`}
                    title="Portafolio La Magdalena"
                    width="100%"
                    height="100%"
                    style={{ border: 'none' }}
                />
            </div>

            {/* Mobile Hint / Overlay if needed */}
            <style>
                {`
                    .portfolio-page {
                        animation: fadeIn 0.5s ease-out;
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                `}
            </style>
        </div>
    );
};

export default PortfolioPage;
