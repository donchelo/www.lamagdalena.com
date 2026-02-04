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

    // Handle scroll to top on route change (already in JarupiaPage but good as global)
    useEffect(() => {
        if (location.hash) {
            const element = document.getElementById(location.hash.substring(1))
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' })
            }
        }
    }, [location])

    return (
        <div className="app">
            <header className="navbar">
                <div className="container">
                    <div className="nav-inner">
                        <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            MENU
                        </button>
                    </div>
                </div>
            </header>

            {/* Menu Overlay */}
            <div className={`menu-overlay ${isMenuOpen ? 'open' : ''}`} onClick={closeMenu}>
                <div className="container" onClick={(e) => e.stopPropagation()}>
                    <button className="menu-close" onClick={closeMenu}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                    <nav className="overlay-nav">
                        <Link to="/#inicio" onClick={closeMenu} className="neon-underline active">INICIO</Link>
                        <Link to="/#nosotros" onClick={closeMenu} className="neon-underline">NOSOTROS</Link>
                        <Link to="/#servicios" onClick={closeMenu} className="neon-underline">SERVICIOS</Link>
                        <Link to="/jarupia-libro" onClick={closeMenu} className="neon-underline">JARUPIA</Link>
                        <Link to="/historias" onClick={closeMenu} className="neon-underline">HISTORIAS</Link>
                        <Link to="/portafolio" onClick={closeMenu} className="neon-underline">PORTAFOLIO</Link>
                        <Link to="/#contacto" onClick={closeMenu} className="neon-underline">CONTACTO</Link>
                    </nav>
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
