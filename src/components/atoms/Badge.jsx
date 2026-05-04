import React from 'react';

const Badge = ({ children, className = '' }) => {
    return (
        <span className={`badge ${className}`.trim()}>
            {children}
        </span>
    );
};

export default Badge;
