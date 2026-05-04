import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { products } from '../data/products'
import MainLayout from '../components/templates/MainLayout'
import Breadcrumbs from '../components/molecules/Breadcrumbs'

const ProductDetailPage = () => {
    const { productId } = useParams()
    const navigate = useNavigate()
    const [product, setProduct] = useState(null)
    const [selectedSize, setSelectedSize] = useState('34 x 76 cm')
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    useEffect(() => {
        const foundProduct = products.find(p => p.id === parseInt(productId))
        if (foundProduct) {
            setProduct(foundProduct)
            setCurrentImageIndex(0)
            window.scrollTo(0, 0)
        } else {
            navigate('/shop')
        }
    }, [productId, navigate])

    if (!product) return null

    const productImages = product.images || [product.image]
    const currentImage = productImages[currentImageIndex]

    // WhatsApp message formatting
    const message = encodeURIComponent(`Hola La Magdalena! Estoy interesado en adquirir el print: ${product.title} (Tamaño: ${selectedSize})`)
    const whatsappUrl = `https://wa.me/573042644962?text=${message}`

    // Navigation logic
    const currentIndex = products.findIndex(p => p.id === product.id)
    const prevProduct = products[currentIndex - 1]
    const nextProduct = products[currentIndex + 1]

    const sizes = [
        '34 x 76 cm',
        '51 x 114 cm',
        '69 x 152 cm',
        'Tamaño Personalizado'
    ]

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % productImages.length)
    }

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length)
    }

    return (
        <MainLayout>
            <main className="product-detail-page">
                <div className="container">
                    {/* Header with Breadcrumbs and Nav */}
                    <div className="product-detail-nav">
                        <Breadcrumbs 
                            className="detail-breadcrumbs"
                            items={[
                                { label: 'Inicio', path: '/' },
                                { label: 'Shop', path: '/shop' },
                                { label: product.title }
                            ]}
                        />
                        <div className="product-pagination">
                            {prevProduct && (
                                <Link to={`/shop/${prevProduct.id}`} className="nav-arrow">⟨</Link>
                            )}
                            {nextProduct && (
                                <Link to={`/shop/${nextProduct.id}`} className="nav-arrow">⟩</Link>
                            )}
                        </div>
                    </div>

                    <div className="product-detail-grid">
                        {/* Left Side: Large Image with Carousel Controls */}
                        <div className="product-detail-image-container">
                            <div className="product-detail-image">
                                <img src={currentImage} alt={product.title} key={currentImageIndex} style={{ animation: 'fadeIn 0.5s ease' }} />
                                
                                {productImages.length > 1 && (
                                    <>
                                        <button className="carousel-control prev" onClick={prevImage}>⟨</button>
                                        <button className="carousel-control next" onClick={nextImage}>⟩</button>
                                        
                                        <div className="image-counter">
                                            {currentImageIndex + 1} / {productImages.length}
                                        </div>
                                    </>
                                )}
                            </div>
                            
                            {/* Thumbnails */}
                            {productImages.length > 1 && (
                                <div className="product-thumbnails">
                                    {productImages.map((img, index) => (
                                        <div 
                                            key={index} 
                                            className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                                            onClick={() => setCurrentImageIndex(index)}
                                        >
                                            <img src={img} alt={`${product.title} view ${index + 1}`} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right Side: Product Info */}
                        <div className="product-detail-info">
                            <h1 className="detail-title">{product.title}</h1>
                            <p className="detail-location">{product.location}</p>
                            
                            <div className="detail-price-box">
                                <span className="detail-price">{product.price} COP</span>
                            </div>

                            <div className="detail-description">
                                <p>{product.description}</p>
                                <p>Esta pieza forma parte de una serie de ediciones limitadas capturadas por La Magdalena. Cada impresión se realiza en papel de bellas artes de calidad de archivo con un acabado mate, asegurando la máxima longevidad y fidelidad de color.</p>
                                
                                <ul className="detail-specs">
                                    <li>Los precios no incluyen montaje ni enmarcado.</li>
                                    <li>Servicio de enmarcado disponible bajo petición.</li>
                                    <li>Tiempo estimado de entrega: 2-3 semanas para impresión y envío.</li>
                                    <li>Envíos internacionales disponibles.</li>
                                </ul>
                            </div>

                            <div className="detail-purchase-options">
                                <div className="size-selector">
                                    <label>Tamaño</label>
                                    <select 
                                        value={selectedSize} 
                                        onChange={(e) => setSelectedSize(e.target.value)}
                                    >
                                        {sizes.map(size => (
                                            <option key={size} value={size}>{size}</option>
                                        ))}
                                    </select>
                                </div>

                                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="commercial-buy-btn">
                                    Consultar disponibilidad
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="shop-footer">
                    <div className="container">
                        <p className="shop-footer-text">Todas las piezas son de edición limitada y se entregan con certificado de autenticidad.</p>
                    </div>
                </footer>
            </main>
        </MainLayout>
    )
}

export default ProductDetailPage
