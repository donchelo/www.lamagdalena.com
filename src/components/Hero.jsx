import React, { useState } from 'react'

const Hero = ({ title, subtitle, images = [], imageUrl, variant = 'default' }) => {
    const photoList = images.length > 0 ? images : (imageUrl ? [imageUrl] : [])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [touchStart, setTouchStart] = useState(null)
    const [touchEnd, setTouchEnd] = useState(null)

    // Auto-slide
    React.useEffect(() => {
        if (photoList.length <= 1) return
        const timer = setInterval(() => {
            nextSlide()
        }, 6000)
        return () => clearInterval(timer)
    }, [currentIndex, photoList.length])

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % photoList.length)
    }

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + photoList.length) % photoList.length)
    }

    // Touch handlers
    const onTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX)
    const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX)
    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return
        const distance = touchStart - touchEnd
        const isLeftSwipe = distance > 50
        const isRightSwipe = distance < -50
        if (isLeftSwipe) nextSlide()
        if (isRightSwipe) prevSlide()
        setTouchStart(null)
        setTouchEnd(null)
    }

    if (photoList.length === 0) return null

    return (
        <section
            className={`hero hero-${variant} ${photoList.length > 1 ? 'hero-gallery' : ''}`}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            <div className="hero-container">
                <div className="hero-image-wrapper">
                    {photoList.map((img, index) => (
                        <div
                            key={index}
                            className={`hero-slide ${index === currentIndex ? 'active' : ''}`}
                        >
                            <img src={img} alt={`${title || 'Hero'} ${index + 1}`} />
                        </div>
                    ))}
                    {/* Add overlay to darken images for better text contrast if needed */}
                    <div className="hero-overlay" style={{
                        position: 'absolute',
                        top: 0, left: 0, width: '100%', height: '100%',
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 80%, rgba(0,0,0,0.15) 100%)',
                        zIndex: 5
                    }}></div>
                </div>

                {variant === 'with-text' && (
                    <div className="hero-content">
                        <h1 className="logo">{title}</h1>
                        {subtitle && <p className="hero-subtitle">{subtitle}</p>}
                    </div>
                )}

                {photoList.length > 1 && (
                    <div className="hero-nav">
                        <button className="nav-btn prev" onClick={prevSlide} aria-label="Previous photo">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>
                        <button className="nav-btn next" onClick={nextSlide} aria-label="Next photo">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>

                        <div className="hero-dots">
                            {photoList.map((_, index) => (
                                <button
                                    key={index}
                                    className={`dot ${index === currentIndex ? 'active' : ''}`}
                                    onClick={() => setCurrentIndex(index)}
                                    aria-label={`Go to photo ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}

export default Hero

