'use client'

import Link from 'next/link'

interface NavItem {
  label: string
  path: string
  hash?: string
}

interface NavLinksProps {
  items: NavItem[]
  onItemClick?: () => void
  activeChecker: (path: string, hash?: string) => boolean
  className?: string
  itemClassName?: string
}

export default function NavLinks({ items, onItemClick, activeChecker, className = '', itemClassName = '' }: NavLinksProps) {
  return (
    <nav className={className}>
      {items.map((item) => (
        <Link
          key={item.path + (item.hash ?? '')}
          href={item.path + (item.hash ?? '')}
          onClick={onItemClick}
          className={`${itemClassName} ${activeChecker(item.path, item.hash) ? 'active' : ''}`.trim()}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
