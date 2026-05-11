'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import NavLinks from '@/components/molecules/NavLinks'

interface NavBarProps {
  theme?: 'dark' | 'light'
}

const mainMenuItems = [
  { label: 'Inicio', path: '/', hash: '#inicio' },
  { label: 'Somos', path: '/somos', hash: '' },
  { label: 'Historias', path: '/historias', hash: '' },
  { label: 'Servicios', path: '/', hash: '#servicios' },
]

const footerMenuItems = [
  { label: 'Tienda', path: '/shop', hash: '' },
  { label: 'Contacto', path: '/', hash: '#contacto' },
]

export default function NavBar({ theme = 'dark' }: NavBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    document.body.classList.toggle('body-locked', isMenuOpen)
    return () => document.body.classList.remove('body-locked')
  }, [isMenuOpen])

  const closeMenu = () => setIsMenuOpen(false)

  const isActive = (path: string, hash = '') => {
    if (path === '/' && hash === '#inicio') return pathname === '/'
    if (hash) return pathname === path
    return pathname === path
  }

  const isDetailPage = ['/historias/', '/shop/', '/jarupia', '/portafolio'].some(
    p => pathname.includes(p) && pathname !== '/historias' && pathname !== '/shop'
  )

  const themeClass = theme === 'light' ? 'theme-light' : 'theme-dark'

  return (
    <>
      <button
        className={`menu-toggle ${isDetailPage ? 'on-detail' : ''} ${themeClass}`}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        Menú
      </button>

      <a
        href="https://instagram.com/lamagdalena___"
        target="_blank"
        rel="noopener noreferrer"
        className={`instagram-link-static ${isDetailPage ? 'on-detail' : ''} ${themeClass}`}
        aria-label="Instagram"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
      </a>

      <div className={`menu-overlay ${isMenuOpen ? 'open' : ''}`} onClick={closeMenu}>
        <div className="menu-container" onClick={e => e.stopPropagation()}>
          <div className="menu-header">
            <button className="menu-close-text" onClick={closeMenu}>Cerrar</button>
          </div>

          <NavLinks
            items={mainMenuItems}
            onItemClick={closeMenu}
            activeChecker={isActive}
            className="overlay-nav"
            itemClassName="menu-link"
          />

          <div className="menu-footer">
            {footerMenuItems.map(item => (
              <Link
                key={item.path + item.hash}
                href={item.path + item.hash}
                onClick={closeMenu}
                className={`footer-link ${isActive(item.path, item.hash) ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
            <a href="https://instagram.com/lamagdalena___" target="_blank" rel="noopener noreferrer" className="footer-link">Síguenos</a>
          </div>
        </div>
      </div>
    </>
  )
}
