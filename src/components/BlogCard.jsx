import React from 'react';
import { Link } from 'react-router-dom';

const BlogCard = ({ image, category, title, excerpt, date, slug }) => {
    const getImageUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${baseUrl}${cleanPath}`;
    };

    return (
        <div className="blog-card">
            <div className="blog-card-image">
                <img src={getImageUrl(image)} alt={title} />
                {category && <span className="blog-category">{category}</span>}
            </div>
            <div className="blog-card-content">
                <span className="blog-date">{date}</span>
                <h3 className="blog-card-title">{title}</h3>
                <p className="blog-card-excerpt">{excerpt}</p>
                <Link to={`/historias/${slug}`} className="read-more">
                    LEER MÁS
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                </Link>
            </div>
        </div>
    );
};

export default BlogCard;
