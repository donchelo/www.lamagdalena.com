import React from 'react';
import { Link } from 'react-router-dom';
import Text from '../atoms/Text';

const NavLinks = ({ items, onItemClick, activeChecker, className = '', itemClassName = '' }) => {
    return (
        <nav className={className}>
            {items.map((item) => (
                <Link
                    key={item.path + item.hash}
                    to={item.path + item.hash}
                    onClick={onItemClick}
                    className={`${itemClassName} ${activeChecker(item.path, item.hash) ? 'active' : ''}`}
                >
                    {item.label}
                </Link>
            ))}
        </nav>
    );
};

export default NavLinks;
