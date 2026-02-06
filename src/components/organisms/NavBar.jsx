import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import NavLinks from '../molecules/NavLinks';
import Button from '../atoms/Button';
import Text from '../atoms/Text';

const NavBar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        if (isMenuOpen) {
            document.body.classList.add('body-locked');
        } else {
            document.body.classList.remove('body-locked');
        }
        return () => document.body.classList.remove('body-locked');
    }, [isMenuOpen]);

    const closeMenu = () => setIsMenuOpen(false);

    const isActive = (path, hash = '') => {
        if (path === '/' && hash === '#inicio') {
            return location.pathname === '/' && (location.hash === '#inicio' || !location.hash);
        }
        if (hash) {
            return location.pathname === path && location.hash === hash;
        }
        return location.pathname === path && !location.hash;
    };

    const isDetailPage = ['/historias/', '/shop/', '/jarupia-libro', '/portafolio', '/fonts'].some(path => 
        location.pathname.includes(path) && location.pathname !== '/historias' && location.pathname !== '/shop'
    );

    const mainMenuItems = [
        { label: 'Inicio', path: '/', hash: '#inicio' },
        { label: 'Somos', path: '/', hash: '#somos' },
        { label: 'Historias', path: '/historias', hash: '' },
        { label: 'Servicios', path: '/', hash: '#servicios' },
    ];

    const footerMenuItems = [
        { label: 'Tienda', path: '/shop', hash: '' },
        { label: 'Contacto', path: '/', hash: '#contacto' },
    ];

    return (
        <>
            {!isDetailPage && (
                <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    Menú
                </button>
            )}

            <div className={`menu-overlay ${isMenuOpen ? 'open' : ''}`} onClick={closeMenu}>
                <div className="menu-container" onClick={(e) => e.stopPropagation()}>
                    <div className="menu-header">
                        <button className="menu-close-text" onClick={closeMenu}>
                            Cerrar
                        </button>
                    </div>

                    <NavLinks
                        items={mainMenuItems}
                        onItemClick={closeMenu}
                        activeChecker={isActive}
                        className="overlay-nav"
                        itemClassName="menu-link"
                    />

                    <div className="menu-footer">
                        {footerMenuItems.map((item, index) => (
                            <React.Fragment key={item.path + item.hash}>
                                <Link 
                                    to={item.path + item.hash} 
                                    onClick={closeMenu} 
                                    className={`footer-link ${isActive(item.path, item.hash) ? 'active' : ''}`}
                                >
                                    {item.label}
                                </Link>
                                {index < footerMenuItems.length - 1 && <Text as="span" className="footer-divider">|</Text>}
                            </React.Fragment>
                        ))}
                        <Text as="span" className="footer-divider">|</Text>
                        <a href="https://instagram.com/lamagdalena___" target="_blank" rel="noopener noreferrer" className="footer-link">Síguenos</a>
                    </div>
                </div>
            </div>
        </>
    );
};

export default NavBar;
