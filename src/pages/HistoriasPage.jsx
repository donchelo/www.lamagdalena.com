import React, { useEffect } from 'react';
import BlogCard from '../components/BlogCard';
import StoryView from '../components/StoryView';
import { storiesData } from '../data/stories';

const HistoriasPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // El primer elemento es la historia principal (Viajando por Colombia)
    const mainStory = storiesData.find(s => s.slug === 'viajando-por-colombia') || storiesData[0];
    const otherStories = storiesData.filter(s => s.id !== mainStory.id);

    return (
        <div className="historias-page" style={{ paddingTop: 0 }}>
            {/* Historia Principal en formato ensayo */}
            <StoryView story={mainStory} />

            {/* Sección de Otras Historias */}
            {otherStories.length > 0 && (
                <section className="blog-section" style={{ borderTop: '1px solid rgba(92, 74, 51, 0.1)', marginTop: '4rem' }}>
                    <div className="container">
                        <h2 className="section-title" style={{ marginTop: '4rem', textAlign: 'center' }}>Más Historias</h2>
                        <div className="blog-grid">
                            {otherStories.map(story => (
                                <BlogCard key={story.id} {...story} />
                            ))}
                        </div>
                    </div>
                </section>
            )}
            
            <footer className="story-footer container" style={{ paddingBottom: '6rem' }}>
                <div className="story-footer-inner">
                    <p className="story-date">{mainStory.date} • {mainStory.category}</p>
                    <div className="story-share">
                        <span className="share-label">Compartir:</span>
                        <a href={`https://instagram.com/lamagdalena___`} target="_blank" rel="noopener noreferrer">Instagram</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HistoriasPage;
