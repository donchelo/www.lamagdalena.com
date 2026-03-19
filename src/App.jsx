import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import './index.css'
import HomePage from './pages/HomePage'
import JarupiaPage from './pages/JarupiaPage'
import HistoriasPage from './pages/HistoriasPage'
import StoryDetailPage from './pages/StoryDetailPage'
import PortfolioPage from './pages/PortfolioPage'
import FontVisualizer from './pages/FontVisualizer'
import ShopPage from './pages/ShopPage'
import ProductDetailPage from './pages/ProductDetailPage'
import NavBar from './components/organisms/NavBar'
import AboutPage from './pages/AboutPage'
import Dashboard from './pages/private/Dashboard'
import ClientManager from './pages/private/tools/ClientManager'
import ContentGenerator from './pages/private/tools/ContentGenerator'
import AudioTranscriber from './pages/private/tools/AudioTranscriber'

function App() {
    const location = useLocation()

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
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/somos" element={<AboutPage />} />
                <Route path="/jarupia-libro" element={<JarupiaPage />} />
                <Route path="/historias" element={<HistoriasPage />} />
                <Route path="/historias/:slug" element={<StoryDetailPage />} />
                <Route path="/portafolio" element={<PortfolioPage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/shop/:productId" element={<ProductDetailPage />} />
                <Route path="/fonts" element={<FontVisualizer />} />
                
                {/* Private Dashboard Routes */}
                <Route path="/private" element={<Dashboard />} />
                <Route path="/private/clients" element={<ClientManager />} />
                <Route path="/private/content" element={<ContentGenerator />} />
                <Route path="/private/audio" element={<AudioTranscriber />} />
            </Routes>
        </div>
    )
}
export default App
