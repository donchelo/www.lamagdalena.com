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
                    case 'text':
                        return (
                            <section key={index} className="story-text-block container">
                                <div className="story-text-content">
                                    <p>{block.text}</p>
                                </div>
                            </section>
                        );
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
                    case 'grid':
                        return (
                            <section key={index} className="story-grid-block container">
                                <div className={`story-grid story-grid-${block.images.length}`}>
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
                                    <p className="quote-text">"{block.text}"</p>
                                    {block.author && <cite className="quote-author">— {block.author}</cite>}
                                </blockquote>
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
