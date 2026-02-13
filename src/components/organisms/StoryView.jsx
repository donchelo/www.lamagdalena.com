import React from 'react';
import { Link } from 'react-router-dom';

const StoryView = ({ story }) => {
    const getImageUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${baseUrl}${cleanPath}`;
    };

    const parseText = (text) => {
        if (!text) return '';
        // Basic markdown-like parsing for bold and italic
        return text.split(/(\*\*.*?\*\*|\*.*?\*)/g).map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('*') && part.endsWith('*')) {
                return <em key={i}>{part.slice(1, -1)}</em>;
            }
            return part;
        });
    };

    if (!story) return null;

    const isEditorial = story.layout === 'editorial-grid';

    // Helper to render individual blocks
    // For editorial, we strip the 'container' class because the grid handles width
    const renderBlock = (block, index) => {
        const containerClass = isEditorial ? '' : 'container';

        switch (block.type) {
            case 'hero':
                // In editorial, hero is handled structurally outside the loop
                if (isEditorial) return null;
                return (
                    <section key={index} className="story-hero-block">
                        <div className="story-hero-image">
                            <img src={getImageUrl(block.image)} alt={block.title} />
                            <div className="story-hero-overlay"></div>
                        </div>
                        <div className="story-hero-content container">
                            <h1 className="story-main-title">{block.title}</h1>
                            {block.subtitle && <p className="story-subtitle">{block.subtitle}</p>}
                        </div>
                    </section>
                );
            case 'metadata':
                // In editorial, metadata is in sidebar
                if (isEditorial) return null;
                return (
                    <section key={index} className="story-metadata-block container">
                        <div className="story-metadata-content">
                            <div className="metadata-top">
                                <span className="metadata-category">{block.category || story.category}</span>
                                {block.author && <span className="metadata-author">Por {block.author}</span>}
                            </div>
                            <div className="metadata-bottom">
                                <span className="metadata-location">{block.location}</span>
                                <span className="metadata-date">{block.date || story.date}</span>
                            </div>
                        </div>
                    </section>
                );
            case 'lead':
                return (
                    <section key={index} className={`story-lead-block ${containerClass}`}>
                        <div className="story-lead-content">
                            <p className="story-lead">{parseText(block.text)}</p>
                        </div>
                    </section>
                );
            case 'text':
                return (
                    <section key={index} className={`story-text-block ${containerClass}`}>
                        <div className="story-text-content">
                            <p className={isEditorial && (index === 0 || index === 1) ? 'has-drop-cap' : ''}>
                                {parseText(block.text)}
                            </p>
                        </div>
                    </section>
                );
            case 'interview':
                return (
                    <section key={index} className={`story-interview-block ${containerClass}`}>
                        <div className="interview-content">
                            <div className="interview-question">
                                {parseText(block.question)}
                            </div>
                            <div className="interview-answer">
                                {block.answer.split('\n').map((p, i) => (
                                    <p key={i}>{parseText(p)}</p>
                                ))}
                            </div>
                        </div>
                    </section>
                );
            case 'separator':
                return <div key={index} className="story-separator"></div>;
            case 'image-full':
                return (
                    <section key={index} className="story-image-full-block">
                        <figure>
                            <img src={getImageUrl(block.image)} alt={block.caption || story.title} />
                            {block.caption && <figcaption className={containerClass}>{block.caption}</figcaption>}
                        </figure>
                    </section>
                );
            case 'image-container':
                return (
                    <section key={index} className={`story-image-container-block ${containerClass}`}>
                        <figure>
                            <img src={getImageUrl(block.image)} alt={block.caption || story.title} />
                            {block.caption && <figcaption>{block.caption}</figcaption>}
                        </figure>
                    </section>
                );
            case 'image-text':
                return (
                    <section key={index} className={`story-image-text-block ${containerClass} ${block.layout || 'image-left'} split-${block.split || '50-50'}`}>
                        <div className="story-image-text-content">
                            <div className="side-image">
                                <img src={getImageUrl(block.image)} alt={block.caption || story.title} />
                                {block.caption && <figcaption>{block.caption}</figcaption>}
                            </div>
                            <div className="side-text">
                                {block.title && <h3 className="side-title">{block.title}</h3>}
                                <div className="side-description">
                                    {block.text.split('\n').map((p, i) => (
                                        <p key={i}>{parseText(p)}</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                );
            case 'image-duo':
                return (
                    <section key={index} className={`story-image-duo-block ${containerClass} split-${block.split || '50-50'}`}>
                        <div className="duo-grid">
                            <figure className="duo-item">
                                <img src={getImageUrl(block.imageLeft)} alt={story.title} />
                            </figure>
                            <figure className="duo-item">
                                <img src={getImageUrl(block.imageRight)} alt={story.title} />
                            </figure>
                        </div>
                        {block.caption && <figcaption>{block.caption}</figcaption>}
                    </section>
                );
            case 'image-stack':
                return (
                    <section key={index} className={`story-image-stack-block ${containerClass}`}>
                        <div className="stack-grid">
                            <div className="stack-main">
                                <img src={getImageUrl(block.mainImage)} alt={story.title} />
                            </div>
                            <div className="stack-side">
                                <img src={getImageUrl(block.sideImage1)} alt={story.title} />
                                <img src={getImageUrl(block.sideImage2)} alt={story.title} />
                            </div>
                        </div>
                        {block.caption && <figcaption>{block.caption}</figcaption>}
                    </section>
                );
            case 'grid':
                return (
                    <section key={index} className={`story-grid-block ${containerClass}`}>
                        <div className={`story-grid story-grid-${block.images.length} ${block.variant || ''}`}>
                            {block.images.map((img, i) => (
                                <div key={i} className="story-grid-item">
                                    <img src={getImageUrl(img)} alt={`${story.title} grid ${i}`} />
                                </div>
                            ))}
                        </div>
                        {block.caption && <figcaption className="story-grid-caption">{block.caption}</figcaption>}
                    </section>
                );
            case 'quote':
                return (
                    <section key={index} className={`story-quote-block ${containerClass}`}>
                        <blockquote>
                            <p className="quote-text">"{parseText(block.text)}"</p>
                            {block.author && <cite className="quote-author">— {block.author}</cite>}
                        </blockquote>
                    </section>
                );
            case 'tags':
                if (isEditorial) return null; // Sidebar
                return (
                    <section key={index} className="story-tags-block container">
                        <div className="story-tags">
                            {block.tags.map((tag, i) => (
                                <React.Fragment key={i}>
                                    <span className="story-tag">{tag}</span>
                                    {i < block.tags.length - 1 && <span className="tag-separator">/</span>}
                                </React.Fragment>
                            ))}
                        </div>
                    </section>
                );
            default:
                return null;
        }
    };

    // Editorial Layout Render
    if (isEditorial) {
        const heroBlock = story.content.find(b => b.type === 'hero');
        const metadataBlock = story.content.find(b => b.type === 'metadata');
        const tagsBlock = story.content.find(b => b.type === 'tags');

        // Filter content blocks (exclude structural blocks that we handle manually)
        const contentBlocks = story.content.filter(b =>
            b.type !== 'hero' &&
            b.type !== 'metadata' &&
            b.type !== 'tags'
        );

        return (
            <article className="story-article editorial-layout">
                {/* Full Width Hero Image Area */}
                {heroBlock && (
                    <div className="editorial-hero-image">
                        <img
                            src={getImageUrl(heroBlock.image)}
                            alt={heroBlock.title}
                            style={{ width: '100%', height: '85vh', objectFit: 'cover', display: 'block' }}
                        />
                    </div>
                )}

                <div className="editorial-layout-wrapper">
                    <div className="editorial-grid-container">
                        {/* 25% Sidebar */}
                        <aside className="editorial-sidebar">
                            <div className="meta-group">
                                <span className="meta-label">Categoría</span>
                                <span className="meta-value">{metadataBlock?.category || story.category}</span>
                            </div>

                            {(metadataBlock?.author || story.author) && (
                                <div className="meta-group">
                                    <span className="meta-label">Autor</span>
                                    <span className="meta-value">{metadataBlock?.author || story.author}</span>
                                </div>
                            )}

                            {(metadataBlock?.date || story.date) && (
                                <div className="meta-group">
                                    <span className="meta-label">Fecha</span>
                                    <span className="meta-value">{metadataBlock?.date || story.date}</span>
                                </div>
                            )}

                            {metadataBlock?.location && (
                                <div className="meta-group">
                                    <span className="meta-label">Lugar</span>
                                    <span className="meta-value">{metadataBlock.location}</span>
                                </div>
                            )}

                            {tagsBlock && (
                                <div className="meta-group" style={{ marginTop: '2rem' }}>
                                    <span className="meta-label">Tags</span>
                                    <div className="meta-value" style={{ fontSize: '0.8rem', lineHeight: '1.6' }}>
                                        {tagsBlock.tags.join(', ')}
                                    </div>
                                </div>
                            )}
                        </aside>

                        {/* 75% Content */}
                        <div className="editorial-content">
                            {/* Title injected here if Hero exists */}
                            {heroBlock && (
                                <header className="editorial-header">
                                    <h1 className="story-title">{heroBlock.title}</h1>
                                    {heroBlock.subtitle && <p className="story-lead">{heroBlock.subtitle}</p>}
                                    {metadataBlock?.author && (
                                        <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', marginTop: '1rem', fontWeight: 500 }}>
                                            Por {metadataBlock.author}
                                        </p>
                                    )}
                                    <div style={{ height: '1px', width: '100px', background: 'var(--text-brown)', margin: '2rem 0', opacity: 0.3 }}></div>
                                </header>
                            )}

                            {contentBlocks.map((block, i) => renderBlock(block, i))}
                        </div>
                    </div>
                </div>
            </article>
        );
    }

    // Default Layout Render
    return (
        <article className="story-article">
            {story.content.map((block, index) => renderBlock(block, index))}
        </article>
    );
};

export default StoryView;
