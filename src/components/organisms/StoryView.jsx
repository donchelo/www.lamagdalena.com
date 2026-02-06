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

    return (
        <article className="story-article">
            {story.content.map((block, index) => {
                switch (block.type) {
                    case 'hero':
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
                            <section key={index} className="story-lead-block container">
                                <div className="story-lead-content">
                                    <p>{parseText(block.text)}</p>
                                </div>
                            </section>
                        );
                    case 'text':
                        return (
                            <section key={index} className="story-text-block container">
                                <div className="story-text-content">
                                    <p className={index === 1 || index === 2 ? 'has-drop-cap' : ''}>
                                        {parseText(block.text)}
                                    </p>
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
                                    {block.caption && <figcaption className="container">{block.caption}</figcaption>}
                                </figure>
                            </section>
                        );
                    case 'image-container':
                        return (
                            <section key={index} className="story-image-container-block container">
                                <figure>
                                    <img src={getImageUrl(block.image)} alt={block.caption || story.title} />
                                    {block.caption && <figcaption>{block.caption}</figcaption>}
                                </figure>
                            </section>
                        );
                    case 'image-text':
                        return (
                            <section key={index} className={`story-image-text-block container ${block.layout || 'image-left'} split-${block.split || '50-50'}`}>
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
                            <section key={index} className={`story-image-duo-block container split-${block.split || '50-50'}`}>
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
                            <section key={index} className="story-image-stack-block container">
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
                            <section key={index} className="story-grid-block container">
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
                            <section key={index} className="story-quote-block container">
                                <blockquote>
                                    <p className="quote-text">"{parseText(block.text)}"</p>
                                    {block.author && <cite className="quote-author">— {block.author}</cite>}
                                </blockquote>
                            </section>
                        );
                    case 'tags':
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
            })}
        </article>
    );
};

export default StoryView;
