import React from 'react';
import { Link } from 'react-router-dom';
import Heading from '../atoms/Heading';
import Text from '../atoms/Text';

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
                {category && <Text as="span" className="blog-category">{category}</Text>}
            </div>
            <div className="blog-card-content">
                <div className="blog-card-bottom">
                    <Heading level={3} className="blog-card-title">{title}</Heading>
                    <div className="blog-card-line"></div>
                    <div className="blog-card-meta">
                        <Text as="span" className="blog-author">{excerpt ? excerpt.split('.')[0] : 'La Magdalena'}</Text>
                        <Text as="span" className="blog-location">{date}</Text>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default BlogCard;
