import React from 'react'
import Heading from '../atoms/Heading'
import Text from '../atoms/Text'

const AboutSection = () => {
    return (
        <section id="somos" className="about-section">
            <div className="container">
                <div className="about-content">
                    <div className="about-text">
                        <Heading level={2} className="section-title">Somos</Heading>
                        <Text variant="lead">Un estudio de storytelling, enfocado en temas de impacto social y ambiental.</Text>
                        <Text>En 2013 empecé a viajar por Colombia con mi cámara para hacer fotos de los paisajes increíbles que tenemos. Con el tiempo entendí que las personas también dan vida a estos lugares, la interacción con el entorno y las historias me inspiraron a hacerme nuevas preguntas que me ayudaran a entender mejor el territorio y los retos que tenemos como humanidad.</Text>
                        <Text>Años después, en 2022 , nace La Magdalena, con la idea de crear narrativas que promuevan cambios y acciones que mejoren las relaciones entre todo lo vivo. Desde entonces hemos acompañado a diferentes organizaciones a diseñar estrategias para contar sus historias, desde las selvas, bosques, océanos, ciénagas, montañas y ciudades, conectando personas con propósitos reales que generan impacto.</Text>
                        
                        <div className="about-signature">
                            <Text className="signature-name">Chino Romero Hoyos</Text>
                            <Text className="signature-role">Fundador La Magdalena</Text>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default AboutSection
