import React from 'react';

const Button = ({ 
    children, 
    onClick, 
    type = 'button', 
    className = '', 
    variant = 'primary', 
    href = '',
    target = '_blank',
    rel = 'noopener noreferrer'
}) => {
    // Map variants to existing classes
    const variantClasses = {
        primary: 'buy-button',
        secondary: 'cta-button',
        commercial: 'commercial-buy-btn',
        submit: 'submit-btn',
        nav: 'nav-btn'
    };

    const combinedClassName = `${variantClasses[variant] || ''} ${className}`.trim();

    if (href) {
        return (
            <a href={href} className={combinedClassName} target={target} rel={rel}>
                {children}
            </a>
        );
    }

    return (
        <button type={type} onClick={onClick} className={combinedClassName}>
            {children}
        </button>
    );
};

export default Button;
