'use client'

import { useState, useEffect, useRef } from 'react'

interface VideoPlayerProps {
  videoId: string
  thumbnail: string
  altText?: string
}

export default function VideoPlayer({ videoId, thumbnail, altText }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const playerRef = useRef<unknown>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isPlaying || !containerRef.current || playerRef.current) return

    const loadVideo = () => {
      playerRef.current = new (window as unknown as { YT: { Player: new (...args: unknown[]) => unknown } }).YT.Player('youtube-player', {
        videoId,
        events: {
          onReady: (event: { target: { playVideo: () => void } }) => event.target.playVideo(),
          onStateChange: (event: { data: number }) => {
            if (event.data === 0) {
              setIsPlaying(false)
              playerRef.current = null
            }
          },
        },
        playerVars: { autoplay: 1, rel: 0, modestbranding: 1 },
      })
    }

    if (!(window as unknown as { YT?: unknown }).YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
      ;(window as unknown as { onYouTubeIframeAPIReady: () => void }).onYouTubeIframeAPIReady = loadVideo
    } else {
      loadVideo()
    }

    return () => {
      if (playerRef.current) {
        ;(playerRef.current as { destroy: () => void }).destroy()
        playerRef.current = null
      }
    }
  }, [isPlaying, videoId])

  return (
    <div className={`video-player-wrapper ${isPlaying ? 'is-playing' : ''}`}>
      <div
        className="video-thumbnail-container"
        onClick={() => setIsPlaying(true)}
        style={{ display: isPlaying ? 'none' : 'block' }}
      >
        <img src={thumbnail} alt={altText ?? 'Video thumbnail'} className="video-thumbnail" />
        <div className="video-overlay">
          <button className="play-button" aria-label="Reproducir video">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
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
  )
}
