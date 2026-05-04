'use client'

import { useState, useEffect } from 'react'

interface StoryBlock {
  type: string
  image?: string
  imageLeft?: string
  imageRight?: string
  mainImage?: string
  sideImage1?: string
  sideImage2?: string
  images?: string[]
  title?: string
  subtitle?: string
  text?: string
  question?: string
  answer?: string
  caption?: string
  category?: string
  author?: string
  location?: string
  date?: string
  layout?: string
  split?: string
  variant?: string
  tags?: string[]
}

interface Story {
  title: string
  category: string
  author: string
  date: string
  location?: string
  layout?: string
  content: StoryBlock[]
}

interface StoryViewProps {
  story: Story
}

export default function StoryView({ story }: StoryViewProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const getAllImages = () => {
    const images: { url: string; caption?: string }[] = []
    story.content.forEach(block => {
      if (block.image) images.push({ url: block.image, caption: block.caption })
      if (block.imageLeft) images.push({ url: block.imageLeft, caption: block.caption })
      if (block.imageRight) images.push({ url: block.imageRight, caption: block.caption })
      if (block.mainImage) images.push({ url: block.mainImage, caption: block.caption })
      if (block.sideImage1) images.push({ url: block.sideImage1, caption: block.caption })
      if (block.sideImage2) images.push({ url: block.sideImage2, caption: block.caption })
      if (block.images) block.images.forEach(img => images.push({ url: img, caption: block.caption }))
    })
    return images
  }

  const galleryImages = getAllImages()

  const openLightbox = (url: string) => {
    const index = galleryImages.findIndex(img => img.url === url)
    if (index !== -1) setLightboxIndex(index)
  }

  const closeLightbox = () => setLightboxIndex(null)

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLightboxIndex(prev => prev !== null ? (prev + 1) % galleryImages.length : null)
  }

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLightboxIndex(prev => prev !== null ? (prev - 1 + galleryImages.length) % galleryImages.length : null)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return
      if (e.key === 'ArrowRight') setLightboxIndex(prev => prev !== null ? (prev + 1) % galleryImages.length : null)
      if (e.key === 'ArrowLeft') setLightboxIndex(prev => prev !== null ? (prev - 1 + galleryImages.length) % galleryImages.length : null)
      if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxIndex, galleryImages.length])

  const parseText = (text: string) => {
    if (!text) return ''
    return text.split(/(\*\*.*?\*\*|\*.*?\*)/g).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>
      if (part.startsWith('*') && part.endsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>
      return part
    })
  }

  const isEditorial = story.layout === 'editorial-grid'

  const ClickableImage = ({ src, alt, className = '', ...props }: { src: string; alt: string; className?: string; style?: React.CSSProperties }) => (
    <img
      src={src}
      alt={alt}
      className={`${className} clickable-gallery-trigger`}
      onClick={() => openLightbox(src)}
      loading="lazy"
      decoding="async"
      {...props}
    />
  )

  const renderBlock = (block: StoryBlock, index: number) => {
    const containerClass = isEditorial ? '' : 'container'

    switch (block.type) {
      case 'hero':
        if (isEditorial) return null
        return (
          <section key={index} className="story-hero-block">
            <div className="story-hero-image">
              <ClickableImage src={block.image!} alt={block.title ?? story.title} />
              <div className="story-hero-overlay"></div>
            </div>
            <div className="story-hero-content container">
              <h1 className="story-main-title">{block.title}</h1>
              {block.subtitle && <p className="story-subtitle">{block.subtitle}</p>}
            </div>
          </section>
        )
      case 'metadata':
        if (isEditorial) return null
        return (
          <section key={index} className={`story-metadata-block container`}>
            <div className="story-metadata-content">
              <div className="metadata-top">
                <span className="metadata-category">{block.category ?? story.category}</span>
                {block.author && <span className="metadata-author">Por {block.author}</span>}
              </div>
              <div className="metadata-bottom">
                <span className="metadata-location">{block.location}</span>
                <span className="metadata-date">{block.date ?? story.date}</span>
              </div>
            </div>
          </section>
        )
      case 'text':
        return (
          <section key={index} className={`story-text-block ${containerClass}`}>
            <div className="story-text-content">
              <p>{parseText(block.text ?? '')}</p>
            </div>
          </section>
        )
      case 'image-full':
        return (
          <section key={index} className="story-image-full-block">
            <figure>
              <ClickableImage src={block.image!} alt={block.caption ?? story.title} />
              {block.caption && <figcaption className={containerClass}>{block.caption}</figcaption>}
            </figure>
          </section>
        )
      case 'image-container':
        return (
          <section key={index} className={`story-image-container-block ${containerClass}`}>
            <figure>
              <ClickableImage src={block.image!} alt={block.caption ?? story.title} />
              {block.caption && <figcaption>{block.caption}</figcaption>}
            </figure>
          </section>
        )
      case 'image-text':
        return (
          <section key={index} className={`story-image-text-block ${containerClass} ${block.layout ?? 'image-left'} split-${block.split ?? '50-50'}`}>
            <div className="story-image-text-content">
              <div className="side-image">
                <ClickableImage src={block.image!} alt={block.caption ?? story.title} />
                {block.caption && <figcaption>{block.caption}</figcaption>}
              </div>
              <div className="side-text">
                {block.title && <h3 className="side-title">{block.title}</h3>}
                <div className="side-description">
                  {(block.text ?? '').split('\n').map((p, i) => <p key={i}>{parseText(p)}</p>)}
                </div>
              </div>
            </div>
          </section>
        )
      case 'image-duo':
        return (
          <section key={index} className={`story-image-duo-block ${containerClass} split-${block.split ?? '50-50'}`}>
            <div className="duo-grid">
              <figure className="duo-item"><ClickableImage src={block.imageLeft!} alt={story.title} /></figure>
              <figure className="duo-item"><ClickableImage src={block.imageRight!} alt={story.title} /></figure>
            </div>
            {block.caption && <figcaption>{block.caption}</figcaption>}
          </section>
        )
      case 'grid':
        return (
          <section key={index} className={`story-grid-block ${containerClass}`}>
            <div className={`story-grid story-grid-${block.images!.length} ${block.variant ?? ''}`}>
              {block.images!.map((img, i) => (
                <div key={i} className="story-grid-item">
                  <ClickableImage src={img} alt={`${story.title} grid ${i}`} />
                </div>
              ))}
            </div>
            {block.caption && <figcaption className="story-grid-caption">{block.caption}</figcaption>}
          </section>
        )
      case 'quote':
        return (
          <section key={index} className={`story-quote-block ${containerClass}`}>
            <blockquote>
              <p className="quote-text">"{parseText(block.text ?? '')}"</p>
              {block.author && <cite className="quote-author">— {block.author}</cite>}
            </blockquote>
          </section>
        )
      default:
        return null
    }
  }

  const heroBlock = story.content.find(b => b.type === 'hero')

  return (
    <article className={`story-article ${isEditorial ? 'editorial-layout' : ''}`}>
      {isEditorial ? (
        <>
          {heroBlock && (
            <div className="editorial-hero-image">
              <img src={heroBlock.image!} alt={story.title} onClick={() => openLightbox(heroBlock.image!)} style={{ cursor: 'pointer' }} loading="lazy" decoding="async" />
            </div>
          )}
          <div className="editorial-layout-wrapper">
            <div className="editorial-grid-container">
              <aside className="editorial-sidebar">
                <div className="meta-group"><span className="meta-label">Categoría</span><span className="meta-value">{story.category}</span></div>
                <div className="meta-group"><span className="meta-label">Autor</span><span className="meta-value">{story.author}</span></div>
                <div className="meta-group"><span className="meta-label">Fecha</span><span className="meta-value">{story.date}</span></div>
                {story.location && <div className="meta-group"><span className="meta-label">Lugar</span><span className="meta-value">{story.location}</span></div>}
              </aside>
              <div className="editorial-content">
                <header className="editorial-header">
                  <h1 className="story-title">{story.title}</h1>
                  <p className="story-lead">{heroBlock?.subtitle}</p>
                  <hr className="editorial-divider" />
                </header>
                {story.content.filter(b => b.type !== 'hero' && b.type !== 'metadata' && b.type !== 'tags').map((block, i) => renderBlock(block, i))}
              </div>
            </div>
          </div>
        </>
      ) : (
        story.content.map((block, index) => renderBlock(block, index))
      )}

      {lightboxIndex !== null && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>×</button>
          <button className="lightbox-nav prev" onClick={prevImage}>‹</button>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <img src={galleryImages[lightboxIndex].url} alt={galleryImages[lightboxIndex].caption ?? 'Gallery Image'} />
            {galleryImages[lightboxIndex].caption && <p className="lightbox-caption">{galleryImages[lightboxIndex].caption}</p>}
            <span className="lightbox-counter">{lightboxIndex + 1} / {galleryImages.length}</span>
          </div>
          <button className="lightbox-nav next" onClick={nextImage}>›</button>
        </div>
      )}
    </article>
  )
}
