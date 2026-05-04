'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { products } from '@/data/products'
import MainLayout from '@/components/templates/MainLayout'
import Breadcrumbs from '@/components/molecules/Breadcrumbs'

const sizes = ['34 x 76 cm', '51 x 114 cm', '69 x 152 cm', 'Tamaño Personalizado']

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = Number(params.productId)
  const [selectedSize, setSelectedSize] = useState('34 x 76 cm')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const product = products.find(p => p.id === productId)

  useEffect(() => {
    if (!product) router.push('/shop')
  }, [product, router])

  if (!product) return null

  const productImages = product.images ?? [product.image]
  const currentImage = productImages[currentImageIndex]
  const currentIndex = products.findIndex(p => p.id === product.id)
  const prevProduct = products[currentIndex - 1]
  const nextProduct = products[currentIndex + 1]
  const whatsappUrl = `https://wa.me/573042644962?text=${encodeURIComponent(`Hola La Magdalena! Estoy interesado en adquirir el print: ${product.title} (Tamaño: ${selectedSize})`)}`

  return (
    <main className="product-detail-page">
      <div className="container">
        <div className="product-detail-nav">
          <Breadcrumbs
            className="detail-breadcrumbs"
            items={[
              { label: 'Inicio', path: '/' },
              { label: 'Shop', path: '/shop' },
              { label: product.title },
            ]}
          />
          <div className="product-pagination">
            {prevProduct && <Link href={`/shop/${prevProduct.id}`} className="nav-arrow">⟨</Link>}
            {nextProduct && <Link href={`/shop/${nextProduct.id}`} className="nav-arrow">⟩</Link>}
          </div>
        </div>

        <div className="product-detail-grid">
          <div className="product-detail-image-container">
            <div className="product-detail-image">
              <img src={currentImage} alt={product.title} key={currentImageIndex} style={{ animation: 'fadeIn 0.5s ease' }} />
              {productImages.length > 1 && (
                <>
                  <button className="carousel-control prev" onClick={() => setCurrentImageIndex(p => (p - 1 + productImages.length) % productImages.length)}>⟨</button>
                  <button className="carousel-control next" onClick={() => setCurrentImageIndex(p => (p + 1) % productImages.length)}>⟩</button>
                  <div className="image-counter">{currentImageIndex + 1} / {productImages.length}</div>
                </>
              )}
            </div>
            {productImages.length > 1 && (
              <div className="product-thumbnails">
                {productImages.map((img, index) => (
                  <div key={index} className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`} onClick={() => setCurrentImageIndex(index)}>
                    <img src={img} alt={`${product.title} view ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="product-detail-info">
            <h1 className="detail-title">{product.title}</h1>
            <p className="detail-location">{product.location}</p>
            <div className="detail-price-box">
              <span className="detail-price">{product.price} COP</span>
            </div>
            <div className="detail-description">
              <p>{product.description}</p>
              <p>Esta pieza forma parte de una serie de ediciones limitadas capturadas por La Magdalena.</p>
              <ul className="detail-specs">
                <li>Los precios no incluyen montaje ni enmarcado.</li>
                <li>Tiempo estimado de entrega: 2-3 semanas.</li>
                <li>Envíos internacionales disponibles.</li>
              </ul>
            </div>
            <div className="detail-purchase-options">
              <div className="size-selector">
                <label>Tamaño</label>
                <select value={selectedSize} onChange={e => setSelectedSize(e.target.value)}>
                  {sizes.map(size => <option key={size} value={size}>{size}</option>)}
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
  )
}
