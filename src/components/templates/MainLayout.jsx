import React, { useState, useEffect } from 'react';
import NavBar from '../organisms/NavBar';

const MainLayout = ({ children }) => {
    const [navTheme, setNavTheme] = useState('dark');

    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -90% 0px', // Look at the top 10% of the viewport
            threshold: 0
        };

        const handleIntersect = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const section = entry.target;
                    // Define which sections are light vs dark
                    const isLightBg = section.classList.contains('blog-section') ||
                        section.classList.contains('contact-main-section') ||
                        section.classList.contains('historias-page') ||
                        section.classList.contains('jarupia-page');

                    setNavTheme(isLightBg ? 'light' : 'dark');
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersect, observerOptions);

        // Sections to observe
        const sections = document.querySelectorAll('section, main > div');
        sections.forEach(section => observer.observe(section));

        return () => observer.disconnect();
    }, []);

    return (
        <div className="main-layout">
            <header>
                <NavBar theme={navTheme} />
            </header>
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child, { navTheme });
                }
                return child;
            })}
        </div>
    );
};

export default MainLayout;
