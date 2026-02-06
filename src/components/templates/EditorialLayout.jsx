import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../atoms/Button';

const EditorialLayout = ({ children }) => {
    const navigate = useNavigate();

    return (
        <div className="editorial-layout">
            <Button 
                variant="none" 
                className="story-back-btn" 
                onClick={() => navigate('/historias')}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Volver
            </Button>
            {children}
        </div>
    );
};

export default EditorialLayout;
