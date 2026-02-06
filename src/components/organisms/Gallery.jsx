import React from 'react'

const Gallery = ({ photos }) => {
    return (
        <section className="gallery-section">
            <div className="container">
                <h2 className="gallery-title">Galería</h2>
                <div className="gallery-grid">
                    {photos.map((photo, index) => (
                        <div key={index} className="gallery-item">
                            <img src={photo} alt={`Gallery item ${index + 1}`} loading="lazy" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Gallery
