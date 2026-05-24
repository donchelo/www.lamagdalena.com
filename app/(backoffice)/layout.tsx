'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'Panel', path: '/dashboard', icon: '◈' },
  { label: 'Social Listening', path: '/social-listening', icon: '◉' },
  { label: 'Share of Voice', path: '/share-of-voice', icon: '⧇' },
  { label: 'Proyección Financiera', path: '/proyeccion-financiera', icon: '◇' },
  { label: 'Sabio IA', path: '/advisor', icon: '✦' },
]

export default function BackofficeLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="private-dashboard">
      {/* Mobile Top Header */}
      <header className="private-mobile-header">
        <button
          className="private-mobile-toggle"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Abrir menú"
        >
          ☰
        </button>
        <Link href="/dashboard" className="private-sidebar-logo" style={{ marginBottom: 0, fontSize: '1.25rem' }}>
          LM <span>Backoffice</span>
        </Link>
        <div style={{ width: 40 }} /> {/* Visual spacer to balance the menu button */}
      </header>

      {/* Mobile Sidebar Backdrop Overlay */}
      <div
        className={`private-sidebar-backdrop ${isMobileOpen ? 'active' : ''}`}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Sidebar Drawer */}
      <aside className={`private-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '3rem' }}>
          <Link href="/dashboard" className="private-sidebar-logo" style={{ marginBottom: 0 }}>
            LM <span>Backoffice</span>
          </Link>
          {/* Mobile Close Button */}
          <button
            className="private-mobile-close"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        </div>

        <nav className="private-nav">
          {navItems.map(item => (
            <Link
              key={item.path}
              href={item.path}
              className={`private-nav-link ${pathname.startsWith(item.path) ? 'active' : ''}`}
              onClick={() => setIsMobileOpen(false)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <Link href="/" className="private-nav-link" onClick={() => setIsMobileOpen(false)}>
            <span>←</span>
            <span>Volver al sitio</span>
          </Link>
        </div>
      </aside>

      <main className="private-content-wrapper">
        {children}
      </main>
    </div>
  )
}

