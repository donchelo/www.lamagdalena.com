'use client'

import { useState, useEffect } from 'react'
import Logo from '@/components/atoms/Logo'
import Heading from '@/components/atoms/Heading'
import Text from '@/components/atoms/Text'
import Button from '@/components/atoms/Button'

interface HeroProps {
  title?: string
  subtitle?: string
  images?: string[]
  imageUrl?: string
  variant?: 'default' | 'with-text'
  navTheme?: 'dark' | 'light'
}

export default function Hero({ title, subtitle, images = [], imageUrl, variant = 'default', navTheme = 'dark' }: HeroProps) {
  const photoList = images.length > 0 ? images : (imageUrl ? [imageUrl] : [])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const nextSlide = () => setCurrentIndex(prev => (prev + 1) % photoList.length)
  const prevSlide = () => setCurrentIndex(prev => (prev - 1 + photoList.length) % photoList.length)

  useEffect(() => {
    if (photoList.length <= 1) return
    const timer = setInterval(nextSlide, 6000)
    return () => clearInterval(timer)
  }, [currentIndex, photoList.length])

  const onTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX)
  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX)
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    if (distance > 50) nextSlide()
    if (distance < -50) prevSlide()
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
        <div className="hero-static-logo-container">
          <Logo variant="neon" className="hero-static-logo" theme={navTheme} />
        </div>
        <div className="hero-image-wrapper">
          {photoList.map((img, index) => (
            <div key={index} className={`hero-slide ${index === currentIndex ? 'active' : ''}`}>
              <img src={img} alt={`${title ?? 'Hero'} ${index + 1}`} loading={index === 0 ? 'eager' : 'lazy'} />
            </div>
          ))}
          <div className="hero-overlay" style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            background: 'linear-gradient(to top right, rgba(0,0,0,0.5), rgba(0,0,0,0))',
            zIndex: 5,
          }} />
        </div>

        {variant === 'with-text' && (
          <div className="hero-content">
            {title && <Heading level={1} className="logo">{title}</Heading>}
            {subtitle && <Text className="hero-subtitle">{subtitle}</Text>}
          </div>
        )}

        {photoList.length > 1 && (
          <div className="hero-nav">
            <Button variant="nav" className="prev" onClick={prevSlide} aria-label="Previous photo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </Button>
            <Button variant="nav" className="next" onClick={nextSlide} aria-label="Next photo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </Button>
            <div className="hero-dots">
              {photoList.map((_, index) => (
                <button key={index} className={`dot ${index === currentIndex ? 'active' : ''}`} onClick={() => setCurrentIndex(index)} aria-label={`Go to photo ${index + 1}`} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
