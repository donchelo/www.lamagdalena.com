import Link from 'next/link'
import Heading from '@/components/atoms/Heading'
import Text from '@/components/atoms/Text'

interface BlogCardProps {
  image: string
  category: string
  title: string
  excerpt: string
  date: string
  slug: string
}

export default function BlogCard({ image, category, title, excerpt, date, slug }: BlogCardProps) {
  return (
    <Link href={`/historias/${slug}`} className="blog-card">
      <div className="blog-card-image">
        <img src={image} alt={title} />
        <div className="blog-card-overlay"></div>
        {category && <Text as="span" className="blog-category">{category}</Text>}
      </div>
      <div className="blog-card-content">
        <div className="blog-card-bottom">
          <Heading level={3} className="blog-card-title">{title}</Heading>
          <div className="blog-card-line"></div>
          <div className="blog-card-meta">
            <Text as="span" className="blog-author">{excerpt ? excerpt.split('.')[0] : 'La Magdalena'}</Text>
            <Text as="span" className="blog-location">{date}</Text>
          </div>
        </div>
      </div>
    </Link>
  )
}
