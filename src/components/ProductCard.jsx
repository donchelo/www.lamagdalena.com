import React from 'react'
import { Link } from 'react-router-dom'

const ProductCard = ({ product }) => {
    return (
        <div className="product-card">
            <Link to={`/shop/${product.id}`} className="product-link">
                <div className="product-image-container">
                    <img src={product.image} alt={product.title} loading="lazy" />
                </div>
                <div className="product-info-commercial">
                    <h3 className="product-title-commercial">{product.title}</h3>
                    <p className="product-location-commercial">{product.location}</p>
                    <p className="product-price-commercial">{product.price} COP</p>
                </div>
            </Link>
        </div>
    )
}

export default ProductCard
