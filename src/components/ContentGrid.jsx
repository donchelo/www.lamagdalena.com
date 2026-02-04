import React from 'react'

const ContentGrid = ({ children, reversed = false }) => {
    return (
        <section className={`content-grid ${reversed ? 'reversed' : ''}`}>
            <div className="container">
                <div className="grid-inner">
                    {children}
                </div>
            </div>
        </section>
    )
}

export const GridItem = ({ imageUrl, text, type = 'image' }) => {
    if (type === 'image') {
        return (
            <div className="grid-item grid-image">
                <img src={imageUrl} alt="Content" />
            </div>
        )
    }
    return (
        <div className="grid-item grid-text">
            <div className="text-content">
                {text.split('\n\n').map((p, i) => (
                    <p key={i}>{p}</p>
                ))}
            </div>
        </div>
    )
}

export default ContentGrid
