interface LogoProps {
  variant?: string
  className?: string
  style?: React.CSSProperties
  theme?: string
}

const logoMap: Record<string, string> = {
  neon: '/assets/logos/Logo-Neon.png',
  '07': '/assets/logos/Logo LM-07.png',
  '10': '/assets/logos/Logo LM-10.png',
  '12': '/assets/logos/Logo LM-12.png',
  '13': '/assets/logos/Logo LM-13.png',
  '15': '/assets/logos/Logo LM-15.png',
  '16': '/assets/logos/Logo LM-16.png',
  '22': '/assets/logos/Logo LM-22.png',
  '28': '/assets/logos/Logo LM-28.png',
}

export default function Logo({ variant = 'neon', className = '', style = {}, theme = '' }: LogoProps) {
  const src = logoMap[variant] ?? logoMap.neon
  const themeClass = theme ? `theme-${theme}` : ''
  return (
    <img
      src={src}
      alt="La Magdalena Logo"
      className={`logo-component ${className} ${themeClass}`.trim()}
      style={{ display: 'block', height: 'auto', ...style }}
    />
  )
}
