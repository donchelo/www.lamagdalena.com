import React from 'react'
import { Link } from 'react-router-dom'
import Heading from '../atoms/Heading'
import Text from '../atoms/Text'

const ProductCard = ({ product, showPrice = true }) => {
    return (
        <div className="product-card">
            <Link to={`/shop/${product.id}`} className="product-link">
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

export default ProductCard
