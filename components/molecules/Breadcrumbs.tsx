import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  path?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <div className={`breadcrumbs ${className}`.trim()}>
      {items.map((item, index) => (
        <span key={index}>
          {item.path ? (
            <Link href={item.path}>{item.label}</Link>
          ) : (
            <span>{item.label}</span>
          )}
          {index < items.length - 1 && <span className="separator"> / </span>}
        </span>
      ))}
    </div>
  )
}
