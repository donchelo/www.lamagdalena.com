import React, { useState, useEffect } from 'react'
import { Routes, Route, useLocation, Link } from 'react-router-dom'
import './index.css'
import HomePage from './pages/HomePage'
import JarupiaPage from './pages/JarupiaPage'
import HistoriasPage from './pages/HistoriasPage'
import PortfolioPage from './pages/PortfolioPage'
import FontVisualizer from './pages/FontVisualizer'
import Footer from './components/Footer'
import Logo from './components/Logo'

function App() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const location = useLocation()

    // Lock body scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.classList.add('body-locked')
        } else {
            document.body.classList.remove('body-locked')
        }
        return () => document.body.classList.remove('body-locked')
    }, [isMenuOpen])

    const closeMenu = () => setIsMenuOpen(false)

    // Helper to determine if a menu link is active
    const isActive = (path, hash = '') => {
        // Special case for Inicio: active if at root with or without #inicio
        if (path === '/' && hash === '#inicio') {
            return location.pathname === '/' && (location.hash === '#inicio' || !location.hash);
        }
        if (hash) {
            return location.pathname === path && location.hash === hash;
        }
        return location.pathname === path && !location.hash;
    };

    // Handle scroll to top on route change
    useEffect(() => {
        if (location.hash) {
            const element = document.getElementById(location.hash.substring(1))
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' })
            }
        } else {
            window.scrollTo(0, 0)
        }
    }, [location])

    return (
        <div className="app">
            <header className="navbar" style={{ display: 'none' }}>
                {/* Navbar elements moved to fixed positions for minimalism */}
            </header>

            <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                MENU
            </button>

            {/* Menu Overlay */}
            <div className={`menu-overlay ${isMenuOpen ? 'open' : ''}`} onClick={closeMenu}>
                <div className="menu-container" onClick={(e) => e.stopPropagation()}>
                    {/* Menu Header */}
                    <div className="menu-header">
                        <button className="menu-close-text" onClick={closeMenu}>
                            Cerrar
                        </button>
                        <div className="menu-logo">
                            <Logo variant="12" style={{ height: '30px' }} />
                        </div>
                        <button className="menu-search-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </button>
                    </div>

                    {/* Main Navigation */}
                    <nav className="overlay-nav">
                        <Link to="/#inicio" onClick={closeMenu} className={`menu-link ${isActive('/', '#inicio') ? 'active' : ''}`}>Inicio</Link>
                        <Link to="/#nosotros" onClick={closeMenu} className={`menu-link ${isActive('/', '#nosotros') ? 'active' : ''}`}>Somos</Link>
                        <Link to="/historias" onClick={closeMenu} className={`menu-link ${isActive('/historias') ? 'active' : ''}`}>Historias</Link>
                        <Link to="/#servicios" onClick={closeMenu} className={`menu-link ${isActive('/', '#servicios') ? 'active' : ''}`}>Servicios</Link>
                    </nav>

                    {/* Menu Footer */}
                    <div className="menu-footer">
                        <div className="shop-container">
                            <span className="footer-link">SHOP</span>
                            <div className="shop-dropdown">
                                <Link to="/jarupia-libro" onClick={closeMenu}>Jarupia</Link>
                                <Link to="/#historias" onClick={closeMenu}>Galería</Link>
                            </div>
                        </div>
                        <span className="footer-divider">|</span>
                        <Link to="/#contacto" onClick={closeMenu} className={`footer-link ${isActive('/', '#contacto') ? 'active' : ''}`}>CONTACTO</Link>
                        <span className="footer-divider">|</span>
                        <a href="https://instagram.com/lamagdalena___" target="_blank" rel="noopener noreferrer" className="footer-link">SIGUENOS</a>
                    </div>
                </div>
            </div>

            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/jarupia-libro" element={<JarupiaPage />} />
                <Route path="/historias" element={<HistoriasPage />} />
                <Route path="/portafolio" element={<PortfolioPage />} />
                <Route path="/fonts" element={<FontVisualizer />} />
            </Routes>

            <Footer />
        </div>
    )
}
export default App
