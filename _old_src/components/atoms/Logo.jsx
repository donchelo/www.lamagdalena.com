import React from 'react';
import { logos } from '../../assets/logos';

const Logo = ({ variant = 'neon', className = '', style = {}, theme = '' }) => {
    let logoSrc;
    if (variant === 'neon') {
        logoSrc = logos.logoNeon;
    } else {
        const logoKey = `logo${variant.padStart(2, '0')}`;
        logoSrc = logos[logoKey] || logos.logoNeon;
    }

    const themeClass = theme ? `theme-${theme}` : '';

    return (
        <img
            src={logoSrc}
            alt="La Magdalena Logo"
            className={`logo-component ${className} ${themeClass}`}
            style={{ display: 'block', height: 'auto', ...style }}
        />
    );
};

export default Logo;
