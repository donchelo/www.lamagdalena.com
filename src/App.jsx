import React, { useState, useEffect } from 'react'
import { Routes, Route, useLocation, Link } from 'react-router-dom'
import './index.css'
import HomePage from './pages/HomePage'
import JarupiaPage from './pages/JarupiaPage'
import HistoriasPage from './pages/HistoriasPage'
import StoryDetailPage from './pages/StoryDetailPage'
import PortfolioPage from './pages/PortfolioPage'
import FontVisualizer from './pages/FontVisualizer'
import ShopPage from './pages/ShopPage'
import ProductDetailPage from './pages/ProductDetailPage'

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

    // #region agent log
    useEffect(() => {
        fetch('http://127.0.0.1:7252/ingest/39485d24-6745-4f77-95f1-969776a5e3dd', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                location: 'App.jsx:59',
                message: 'Menu toggle rendered',
                data: { pathname: location.pathname, isDetailPage: ['/historias/', '/shop/', '/jarupia-libro'].some(p => location.pathname.includes(p)) },
                timestamp: Date.now(),
                sessionId: 'debug-session',
                runId: 'post-fix',
                hypothesisId: 'H1'
            })
        }).catch(() => { });
    }, [location.pathname]);
    // #endregion

    const isDetailPage = ['/historias/', '/shop/', '/jarupia-libro', '/portafolio', '/fonts'].some(path => 
        location.pathname.includes(path) && location.pathname !== '/historias' && location.pathname !== '/shop'
    );

    return (
        <div className="app">
            <header className="navbar" style={{ display: 'none' }}>
                {/* Navbar elements moved to fixed positions for minimalism */}
            </header>

            {!isDetailPage && (
                <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    Menú
                </button>
            )}

            {/* Menu Overlay */}
            <div className={`menu-overlay ${isMenuOpen ? 'open' : ''}`} onClick={closeMenu}>
                <div className="menu-container" onClick={(e) => e.stopPropagation()}>
                    {/* Menu Header */}
                    <div className="menu-header">
                        <button className="menu-close-text" onClick={closeMenu}>
                            Cerrar
                        </button>
                    </div>

                    {/* Main Navigation */}
                    <nav className="overlay-nav">
                        <Link to="/#inicio" onClick={closeMenu} className={`menu-link ${isActive('/', '#inicio') ? 'active' : ''}`}>Inicio</Link>
                        <Link to="/#somos" onClick={closeMenu} className={`menu-link ${isActive('/', '#somos') ? 'active' : ''}`}>Somos</Link>
                        <Link to="/historias" onClick={closeMenu} className={`menu-link ${isActive('/historias') ? 'active' : ''}`}>Historias</Link>
                        <Link to="/#servicios" onClick={closeMenu} className={`menu-link ${isActive('/', '#servicios') ? 'active' : ''}`}>Servicios</Link>
                    </nav>

                    {/* Menu Footer */}
                    <div className="menu-footer">
                        <Link to="/shop" onClick={closeMenu} className="footer-link">Tienda</Link>
                        <span className="footer-divider">|</span>
                        <Link to="/#contacto" onClick={closeMenu} className={`footer-link ${isActive('/', '#contacto') ? 'active' : ''}`}>Contacto</Link>
                        <span className="footer-divider">|</span>
                        <a href="https://instagram.com/lamagdalena___" target="_blank" rel="noopener noreferrer" className="footer-link">Síguenos</a>
                    </div>
                </div>
            </div>

            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/jarupia-libro" element={<JarupiaPage />} />
                <Route path="/historias" element={<HistoriasPage />} />
                <Route path="/historias/:slug" element={<StoryDetailPage />} />
                <Route path="/portafolio" element={<PortfolioPage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/shop/:productId" element={<ProductDetailPage />} />
                <Route path="/fonts" element={<FontVisualizer />} />
            </Routes>
        </div>
    )
}
export default App
