import React, { useEffect } from 'react';
import BlogCard from '../components/BlogCard';

// Temporary mock data for stories
const stories = [
    {
        id: 1,
        title: "El arte de contar historias en el Magdalena",
        category: "Storytelling",
        date: "03 Feb 2026",
        excerpt: "Exploramos cómo las narrativas locales pueden transformar la percepción de una marca y conectar con la audiencia de manera profunda.",
        image: "assets/blog/DSC03743.webp",
        slug: "arte-contar-historias"
    },
    {
        id: 2,
        title: "Documentando lo invisible",
        category: "Audiovisual",
        date: "01 Feb 2026",
        excerpt: "Detrás de cámaras de nuestro último proyecto en la Sierra Nevada, capturando momentos que las palabras no pueden describir.",
        image: "assets/blog/DSC01959.webp",
        slug: "documentando-lo-invisible"
    },
    {
        id: 3,
        title: "Consultoría creativa: Más que consejos",
        category: "Consultoría",
        date: "28 Jan 2026",
        excerpt: "Por qué decidimos enfocarnos en una consultoría humanista y cómo esto impacta en el desarrollo de ideas sostenibles.",
        image: "assets/blog/_DSC1935.webp",
        slug: "consultoria-creativa"
    }
];

const HistoriasPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="historias-page">
            <section className="historias-hero">
                <div className="container">
                    <h1 className="section-title">Historias</h1>
                    <p className="historias-intro">Un espacio para compartir nuestras vivencias, procesos creativos y las historias que dan vida a La Magdalena.</p>
                </div>
            </section>

            <section className="blog-section">
                <div className="container">
                    <div className="blog-grid">
                        {stories.map(story => (
                            <BlogCard key={story.id} {...story} />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HistoriasPage;
