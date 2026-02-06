import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { storiesData } from '../data/stories';
import StoryView from '../components/organisms/StoryView';
import BlogCard from '../components/molecules/BlogCard';
import EditorialLayout from '../components/templates/EditorialLayout';

const StoryDetailPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [story, setStory] = useState(null);

    const { prevStory, nextStory, relatedStories } = useMemo(() => {
        const index = storiesData.findIndex(s => s.slug === slug);
        if (index === -1) return { prevStory: null, nextStory: null, relatedStories: [] };

        const prev = index > 0 ? storiesData[index - 1] : null;
        const next = index < storiesData.length - 1 ? storiesData[index + 1] : null;
        
        // Obtener hasta 3 historias relacionadas (excluyendo la actual)
        const currentCategory = storiesData[index].category;
        const related = storiesData
            .filter(s => s.slug !== slug)
            .sort((a, b) => (a.category === currentCategory ? -1 : 1))
            .slice(0, 3);

        return { prevStory: prev, nextStory: next, relatedStories: related };
    }, [slug]);

    useEffect(() => {
        const foundStory = storiesData.find(s => s.slug === slug);
        if (foundStory) {
            setStory(foundStory);
            window.scrollTo(0, 0);
        } else {
            navigate('/historias');
        }
    }, [slug, navigate]);

    // #region agent log
    useEffect(() => {
        fetch('http://127.0.0.1:7252/ingest/39485d24-6745-4f77-95f1-969776a5e3dd', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                location: 'StoryDetailPage.jsx:43',
                message: 'Story back button rendered',
                data: { slug },
                timestamp: Date.now(),
                sessionId: 'debug-session',
                runId: 'post-fix',
                hypothesisId: 'H1'
            })
        }).catch(() => { });
    }, [slug]);
    // #endregion

    if (!story) return null;

    return (
        <EditorialLayout>
            <div className="story-detail-page">
                <StoryView story={story} />

                <div className="story-nav">
                    {prevStory ? (
                        <Link to={`/historias/${prevStory.slug}`} className="nav-item prev">
                            <span className="nav-label">Anterior</span>
                            <span className="nav-title">{prevStory.title}</span>
                        </Link>
                    ) : <div className="nav-item prev empty"></div>}

                    {nextStory ? (
                        <Link to={`/historias/${nextStory.slug}`} className="nav-item next">
                            <span className="nav-label">Siguiente</span>
                            <span className="nav-title">{nextStory.title}</span>
                        </Link>
                    ) : <div className="nav-item next empty"></div>}
                </div>

                <footer className="story-footer">
                    <section className="blog-section" style={{ marginTop: '4rem' }}>
                        <div className="container-fluid" style={{ padding: '0 2rem' }}>
                            {relatedStories.length > 0 && (
                                <div className="related-stories-section">
                                    <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '4rem' }}>Otras historias</h2>
                                    <div className="blog-grid">
                                        {relatedStories.map(s => (
                                            <BlogCard key={s.id} {...s} />
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            <div className="story-footer-inner" style={{ marginTop: '8rem', paddingBottom: '4rem', justifyContent: 'center', opacity: 0.5 }}>
                                <p className="story-date">{story.date} • {story.category} • La Magdalena</p>
                            </div>
                        </div>
                    </section>
                </footer>
            </div>
        </EditorialLayout>
    );
};

export default StoryDetailPage;
