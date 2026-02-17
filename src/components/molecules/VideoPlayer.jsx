import React, { useState } from 'react';
import './VideoPlayer.css';

const VideoPlayer = ({ videoId, thumbnail, altText }) => {
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePlay = () => {
        setIsPlaying(true);
    };

    return (
        <div className={`video-player-wrapper ${isPlaying ? 'is-playing' : ''}`}>
            {!isPlaying ? (
                <div className="video-thumbnail-container" onClick={handlePlay}>
                    <img src={thumbnail} alt={altText || "Video thumbnail"} className="video-thumbnail" />
                    <div className="video-overlay">
                        <button className="play-button" aria-label="Reproducir video">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="video-iframe-container">
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    ></iframe>
                </div>
            )}
        </div>
    );
};

export default VideoPlayer;
