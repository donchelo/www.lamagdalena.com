import React from 'react'
import Heading from '../atoms/Heading'
import Text from '../atoms/Text'
import VideoPlayer from '../molecules/VideoPlayer'
import videoThumbnail from '../../assets/hero/DJI_0178.webp'

const AboutSection = () => {
    return (
        <section id="somos-content" className="about-section-new">
            <div className="container">
                <div className="about-split-grid">
                    <div className="about-grid-label">
                        <span className="label-caps">/ SOMOS</span>
                    </div>
                    <div className="about-grid-content">
                        <div className="about-main-text">
                            <Text variant="lead" className="editorial-lead">
                                Un estudio de storytelling, enfocado en temas de impacto social y ambiental.
                            </Text>

                            <div className="about-video-container" style={{ marginBottom: '4rem' }}>
                                <VideoPlayer
                                    videoId="wxKvSy6-2uM"
                                    thumbnail={videoThumbnail}
                                    altText="La Magdalena - Showreel"
                                />
                            </div>

                            <div className="about-body-columns">
                                <Text>
                                    En 2013 empecé a viajar por Colombia con mi cámara para hacer fotos de los paisajes increíbles que tenemos. Con el tiempo entendí que las personas también dan vida a estos lugares, la interacción con el entorno y las historias me inspiraron a hacerme nuevas preguntas que me ayudaran a entender mejor el territorio y los retos que tenemos como humanidad.
                                </Text>
                                <Text>
                                    Años después, in 2022, nace La Magdalena, con la idea de crear narrativas que promuevan cambios y acciones que mejoren las relaciones entre todo lo vivo. Desde entonces hemos acompañado a diferentes organizaciones a diseñar estrategias para contar sus historias, desde las selvas, bosques, océanos, ciénagas, montañas y ciudades, conectando personas con propósitos reales que generan impacto.
                                </Text>
                            </div>

                            <div className="about-signature-new">
                                <Text className="signature-name">Chino Romero Hoyos</Text>
                                <Text className="signature-role">Fundador La Magdalena</Text>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection
