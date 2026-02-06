import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { storiesData } from '../data/stories';
import StoryView from '../components/StoryView';

const StoryDetailPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [story, setStory] = useState(null);

    useEffect(() => {
        const foundStory = storiesData.find(s => s.slug === slug);
        if (foundStory) {
            setStory(foundStory);
            window.scrollTo(0, 0);
        } else {
            navigate('/historias');
        }
    }, [slug, navigate]);

    if (!story) return null;

    return (
        <div className="story-detail-page">
            <Link to="/historias" className="story-back-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Volver a Historias
            </Link>

            <StoryView story={story} />

            <footer className="story-footer container">
                <div className="story-footer-inner">
                    <p className="story-date">{story.date} • {story.category}</p>
                    <div className="story-share">
                        <span className="share-label">Compartir:</span>
                        <a href={`https://instagram.com/lamagdalena___`} target="_blank" rel="noopener noreferrer">Instagram</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default StoryDetailPage;
