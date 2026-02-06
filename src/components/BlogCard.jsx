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
        <Link to={`/historias/${slug}`} className="blog-card">
            <div className="blog-card-image">
                <img src={getImageUrl(image)} alt={title} />
                <div className="blog-card-overlay"></div>
                {category && <span className="blog-category">{category}</span>}
            </div>
            <div className="blog-card-content">
                <div className="blog-card-bottom">
                    <h3 className="blog-card-title">{title}</h3>
                    <div className="blog-card-line"></div>
                    <div className="blog-card-meta">
                        <span className="blog-author">{excerpt ? excerpt.split('.')[0] : 'La Magdalena'}</span>
                        <span className="blog-location">{date}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default BlogCard;
