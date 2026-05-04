import React from 'react';

const Heading = ({ level = 2, children, className = '', variant = '' }) => {
    const Tag = level === 'logo' ? 'div' : `h${level}`;
    
    // Map variants to existing CSS classes if needed, 
    // or just use className for specific styling
    const combinedClassName = `${variant ? `heading-${variant}` : ''} ${className}`.trim();

    return <Tag className={combinedClassName}>{children}</Tag>;
};

export default Heading;
