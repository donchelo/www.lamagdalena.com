import { createElement } from 'react'

interface HeadingProps {
  level?: number | 'logo'
  children: React.ReactNode
  className?: string
  variant?: string
  style?: React.CSSProperties
}

export default function Heading({ level = 2, children, className = '', variant = '', style }: HeadingProps) {
  const tag = level === 'logo' ? 'div' : `h${level}`
  const combined = `${variant ? `heading-${variant}` : ''} ${className}`.trim()
  return createElement(tag, { className: combined, style }, children)
}
