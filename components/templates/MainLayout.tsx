'use client'

import { useState, useEffect, ReactNode } from 'react'
import NavBar from '@/components/organisms/NavBar'

interface MainLayoutProps {
  children: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [navTheme, setNavTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -90% 0px',
      threshold: 0,
    }

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const section = entry.target
          const isLight =
            section.classList.contains('blog-section') ||
            section.classList.contains('contact-main-section') ||
            section.classList.contains('historias-page') ||
            section.classList.contains('jarupia-page')
          setNavTheme(isLight ? 'light' : 'dark')
        }
      })
    }

    const observer = new IntersectionObserver(handleIntersect, observerOptions)
    document.querySelectorAll('section, main > div').forEach(s => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="main-layout">
      <header>
        <NavBar theme={navTheme} />
      </header>
      {children}
    </div>
  )
}
