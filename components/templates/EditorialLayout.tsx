'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/atoms/Button'
import NavBar from '@/components/organisms/NavBar'

interface EditorialLayoutProps {
  children: ReactNode
}

export default function EditorialLayout({ children }: EditorialLayoutProps) {
  const router = useRouter()

  return (
    <div className="editorial-layout">
      <NavBar />
      <Button
        variant="none"
        className="story-back-btn"
        onClick={() => router.push('/historias')}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Volver
      </Button>
      {children}
    </div>
  )
}
