import Link from 'next/link'
import Heading from '@/components/atoms/Heading'
import Text from '@/components/atoms/Text'

interface Product {
  id: number
  title: string
  location: string
  price: string
  image: string
}

interface ProductCardProps {
  product: Product
  showPrice?: boolean
}

export default function ProductCard({ product, showPrice = true }: ProductCardProps) {
  return (
    <div className="product-card">
      <Link href={`/shop/${product.id}`} className="product-link">
        <div className="product-image-container">
          <img src={product.image} alt={product.title} loading="lazy" />
        </div>
        <div className="product-info-commercial">
          <Heading level={3} className="product-title-commercial">{product.title}</Heading>
          <Text className="product-location-commercial">{product.location}</Text>
          {showPrice && <Text className="product-price-commercial">{product.price} COP</Text>}
        </div>
      </Link>
    </div>
  )
}
