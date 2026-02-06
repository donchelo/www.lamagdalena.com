import React, { useEffect } from 'react';
import MainLayout from '../components/templates/MainLayout';
import BlogCard from '../components/molecules/BlogCard';
import { storiesData } from '../data/stories';

const HistoriasPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <MainLayout>
            <div className="historias-page" style={{ paddingTop: '120px' }}>
                {/* Sección de Historias en Grilla */}
                <section className="blog-section">
                    <div className="container-fluid" style={{ padding: '0 2rem' }}>
                        <div className="blog-grid">
                            {storiesData.map(story => (
                                <BlogCard key={story.id} {...story} />
                            ))}
                        </div>
                    </div>
                </section>
                
                <footer className="story-footer container" style={{ paddingBottom: '6rem', marginTop: '4rem' }}>
                    <div className="story-footer-inner">
                        <p className="story-date">La Magdalena • Historias</p>
                        <div className="story-share">
                            <span className="share-label">Síguenos:</span>
                            <a href={`https://instagram.com/lamagdalena___`} target="_blank" rel="noopener noreferrer">Instagram</a>
                        </div>
                    </div>
                </footer>
            </div>
        </MainLayout>
    );
};

export default HistoriasPage;
