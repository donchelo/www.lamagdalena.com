import React from 'react';

const Text = ({ children, className = '', variant = '', as = 'p' }) => {
    const Tag = as;
    
    // variants could be 'lead', 'label-caps', 'case-study-label', 'small'
    const variantClass = variant ? (variant === 'lead' ? 'lead' : variant) : '';
    const combinedClassName = `${variantClass} ${className}`.trim();

    return <Tag className={combinedClassName}>{children}</Tag>;
};

export default Text;
