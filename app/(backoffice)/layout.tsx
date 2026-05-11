'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'Panel', path: '/dashboard', icon: '◈' },
  { label: 'Social Listening', path: '/social-listening', icon: '◉' },
  { label: 'Proyección Financiera', path: '/proyeccion-financiera', icon: '◇' },
  { label: 'Sabio IA', path: '/advisor', icon: '✦' },
  { label: 'Design System', path: '/design-system', icon: '❖' },
]

export default function BackofficeLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="private-dashboard">
      <aside className="private-sidebar">
        <Link href="/dashboard" className="private-sidebar-logo">
          LM <span>Backoffice</span>
        </Link>
        <nav className="private-nav">
          {navItems.map(item => (
            <Link
              key={item.path}
              href={item.path}
              className={`private-nav-link ${pathname.startsWith(item.path) ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div style={{ marginTop: 'auto' }}>
          <Link href="/" className="private-nav-link">
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
