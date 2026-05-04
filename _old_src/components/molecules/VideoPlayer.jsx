import React, { useState, useEffect, useRef } from 'react';
import './VideoPlayer.css';

const VideoPlayer = ({ videoId, thumbnail, altText }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const playerRef = useRef(null);
    const containerRef = useRef(null);

    const handlePlay = () => {
        setIsPlaying(true);
    };

    useEffect(() => {
        // Only initialize API if playing and container exists
        if (isPlaying && containerRef.current && !playerRef.current) {
            const loadVideo = () => {
                playerRef.current = new window.YT.Player('youtube-player', {
                    videoId: videoId,
                    events: {
                        'onReady': (event) => {
                            event.target.playVideo();
                        },
                        'onStateChange': (event) => {
                            // YT.PlayerState.ENDED is 0
                            if (event.data === 0) {
                                setIsPlaying(false);
                                playerRef.current = null;
                            }
                        }
                    },
                    playerVars: {
                        autoplay: 1,
                        rel: 0,
                        modestbranding: 1
                    }
                });
            };

            if (!window.YT) {
                // Load script if not available
                const tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

                window.onYouTubeIframeAPIReady = loadVideo;
            } else {
                loadVideo();
            }
        }

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        };
    }, [isPlaying, videoId]);

    return (
        <div className={`video-player-wrapper ${isPlaying ? 'is-playing' : ''}`}>
            <div
                className="video-thumbnail-container"
                onClick={handlePlay}
                style={{ display: isPlaying ? 'none' : 'block' }}
            >
                <img src={thumbnail} alt={altText || "Video thumbnail"} className="video-thumbnail" />
                <div className="video-overlay">
                    <button className="play-button" aria-label="Reproducir video">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </button>
                </div>
            </div>

            <div
                className="video-iframe-container"
                ref={containerRef}
                style={{ display: isPlaying ? 'block' : 'none' }}
            >
                <div id="youtube-player"></div>
            </div>
        </div>
    );
};

export default VideoPlayer;
