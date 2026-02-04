import React from 'react';
import { logos } from '../assets/logos';

const Logo = ({ variant = '01', className = '', style = {} }) => {
    const logoKey = `logo${variant.padStart(2, '0')}`;
    const logoSrc = logos[logoKey] || logos.logo01;

    return (
        <img
            src={logoSrc}
            alt="La Magdalena Logo"
            className={`logo-component ${className}`}
            style={{ display: 'block', height: 'auto', ...style }}
        />
    );
};

export default Logo;
