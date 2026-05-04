'use client'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
  variant?: 'primary' | 'secondary' | 'commercial' | 'submit' | 'nav' | 'none'
  href?: string
  target?: string
  rel?: string
  id?: string
  disabled?: boolean
  style?: React.CSSProperties
}

const variantClasses: Record<string, string> = {
  primary: 'buy-button',
  secondary: 'cta-button',
  commercial: 'commercial-buy-btn',
  submit: 'submit-btn',
  nav: 'nav-btn',
  none: '',
}

export default function Button({
  children, onClick, type = 'button', className = '',
  variant = 'primary', href, target = '_blank', rel = 'noopener noreferrer',
  id, disabled = false, style,
}: ButtonProps) {
  const combined = `${variantClasses[variant] || ''} ${className}`.trim()

  if (href) {
    return <a href={href} className={combined} target={target} rel={rel} id={id} style={style}>{children}</a>
  }

  return (
    <button type={type} onClick={onClick} className={combined} id={id} disabled={disabled} style={style}>
      {children}
    </button>
  )
}
