import { ElementType, CSSProperties } from 'react'

interface TextProps {
  children: React.ReactNode
  className?: string
  variant?: string
  as?: ElementType
  style?: CSSProperties
}

export default function Text({ children, className = '', variant = '', as: Tag = 'p', style }: TextProps) {
  const variantClass = variant === 'lead' ? 'lead' : variant
  const combined = `${variantClass} ${className}`.trim()
  return <Tag className={combined} style={style}>{children}</Tag>
}
