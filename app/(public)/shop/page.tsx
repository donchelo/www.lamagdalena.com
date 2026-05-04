'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { products, categories } from '@/data/products'
import ProductCard from '@/components/molecules/ProductCard'
import Breadcrumbs from '@/components/molecules/Breadcrumbs'

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('Destacados')
  const [filteredProducts, setFilteredProducts] = useState(products)

  useEffect(() => {
    let result = products
    if (activeCategory !== 'Todos') result = result.filter(p => p.category === activeCategory)
    if (searchTerm) result = result.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.location.toLowerCase().includes(searchTerm.toLowerCase()))
    if (sortBy === 'Precio: Menor a Mayor') {
      result = [...result].sort((a, b) => parseInt(a.price.replace(/[$.]/g, '')) - parseInt(b.price.replace(/[$.]/g, '')))
    } else if (sortBy === 'Precio: Mayor a Menor') {
      result = [...result].sort((a, b) => parseInt(b.price.replace(/[$.]/g, '')) - parseInt(a.price.replace(/[$.]/g, '')))
    }
    setFilteredProducts(result)
  }, [activeCategory, searchTerm, sortBy])

  return (
    <main className="shop-page">
      <section className="shop-commercial-header">
        <div className="container">
          <div className="shop-controls-wrapper">
            <Breadcrumbs
              className="shop-breadcrumbs"
              items={[
                { label: 'Inicio', path: '/' },
                { label: 'Shop', path: '/shop' },
                { label: 'Página 1 de 1' },
              ]}
            />
            <div className="shop-filters-commercial">
              <div className="filter-group">
                <label>Filtrar por:</label>
                <select value={activeCategory} onChange={e => setActiveCategory(e.target.value)}>
                  {categories.map(cat => <option key={cat} value={cat}>{cat === 'Todos' ? 'Todos los prints' : cat}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label>Ordenar por:</label>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option>Destacados</option>
                  <option>Precio: Menor a Mayor</option>
                  <option>Precio: Mayor a Menor</option>
                </select>
              </div>
              <div className="search-group">
                <input type="text" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                <span className="search-icon">🔍</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="shop-products-commercial">
        <div className="container">
          <div className="products-grid-commercial">
            {filteredProducts.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
          {filteredProducts.length === 0 && <p className="no-products">No se encontraron productos.</p>}
        </div>
      </section>

      <section className="shop-featured-commercial">
        <div className="container">
          <div className="featured-divider"></div>
          <div className="featured-grid">
            <div className="featured-item author-featured">
              <div className="featured-image">
                <img src="/assets/photos/content-1.jpg" alt="Andrés Camilo Romero - Autor" />
                <div className="featured-label">Autor</div>
              </div>
              <div className="featured-info">
                <h2>Chino Romero</h2>
                <p>Andrés Camilo Romero Hoyos es el alma detrás de las narrativas que exploramos.</p>
              </div>
            </div>
            <div className="featured-item book-featured">
              <div className="featured-image">
                <img src="/assets/photos/jarupia/image-2.webp" alt="Jarupia" />
                <div className="featured-label">Obra Destacada</div>
              </div>
              <div className="featured-info">
                <h2>Jarupia</h2>
                <p>Una historia tejida en el territorio, donde la realidad y la fantasía se encuentran en la Ciénaga de Ayapel.</p>
                <Link href="/jarupia-libro" className="learn-more">Explorar obra →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="shop-footer">
        <div className="container">
          <p className="shop-footer-text">Todas las piezas son de edición limitada. Los ingresos apoyan la creación de nuevas historias.</p>
        </div>
      </footer>
    </main>
  )
}
