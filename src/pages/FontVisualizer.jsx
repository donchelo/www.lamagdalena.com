import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FontVisualizer = () => {
    const [sampleText, setSampleText] = useState('La Magdalena - Contamos historias que perduran.');
    const [fontSize, setFontSize] = useState(48);

    const fonts = [
        {
            name: 'Bebas Neue',
            variable: '--font-logo',
            description: 'Fuente para títulos y encabezados principales.',
            usage: 'font-family: var(--font-logo);'
        },
        {
            name: 'Roboto',
            variable: '--font-body',
            description: 'Fuente principal para todo el contenido (Cuerpo, Menú, Acentos).',
            usage: 'font-family: var(--font-body);'
        }
    ];

    return (
        <div style={{ 
            padding: '120px 20px 60px', 
            maxWidth: '1200px', 
            margin: '0 auto',
            minHeight: '100vh',
            backgroundColor: 'var(--bg-cream)',
            backgroundImage: 'var(--bg-paper)',
            backgroundSize: 'cover',
            backgroundAttachment: 'fixed'
        }}>
            <header style={{ marginBottom: '60px', borderBottom: '1px solid var(--text-brown)', paddingBottom: '20px' }}>
                <Link to="/" style={{ 
                    fontFamily: 'var(--font-menu)', 
                    fontSize: '0.9rem', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em',
                    color: 'var(--text-brown)',
                    display: 'inline-block',
                    marginBottom: '20px'
                }}>
                    ← Volver al inicio
                </Link>
                <h1 style={{ fontFamily: 'var(--font-logo)', color: 'var(--text-brown)' }}>Visualizador de Fuentes</h1>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.2rem', color: 'var(--text-brown)', opacity: 0.8 }}>
                    Guía de tipografía para La Magdalena.
                </p>
            </header>

            <section style={{ 
                marginBottom: '40px', 
                background: 'white', 
                padding: '30px', 
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '20px',
                alignItems: 'center'
            }}>
                <div style={{ flex: '1 1 300px' }}>
                    <label style={{ display: 'block', marginBottom: '10px', fontFamily: 'var(--font-menu)', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>
                        Texto de prueba
                    </label>
                    <input 
                        type="text" 
                        value={sampleText} 
                        onChange={(e) => setSampleText(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            fontSize: '1rem',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontFamily: 'var(--font-body)'
                        }}
                    />
                </div>
                <div style={{ flex: '0 1 200px' }}>
                    <label style={{ display: 'block', marginBottom: '10px', fontFamily: 'var(--font-menu)', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>
                        Tamaño: {fontSize}px
                    </label>
                    <input 
                        type="range" 
                        min="16" 
                        max="120" 
                        value={fontSize} 
                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                        style={{ width: '100%' }}
                    />
                </div>
            </section>

            <div style={{ display: 'grid', gap: '40px' }}>
                {fonts.map((font) => (
                    <div key={font.name} style={{ 
                        background: 'white', 
                        padding: '40px', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                        borderLeft: '4px solid var(--accent-lime)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                            <div>
                                <h2 style={{ fontFamily: 'var(--font-logo)', fontSize: '1.5rem', marginBottom: '5px', color: 'var(--text-brown)' }}>{font.name}</h2>
                                <p style={{ fontFamily: 'var(--font-body)', color: '#666' }}>{font.description}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <code style={{ display: 'block', background: '#f5f5f5', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', color: 'var(--text-brown)' }}>
                                    {font.variable}
                                </code>
                                <code style={{ display: 'block', background: '#f5f5f5', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', color: 'var(--text-brown)', marginTop: '5px' }}>
                                    {font.usage}
                                </code>
                            </div>
                        </div>
                        
                        <div style={{ 
                            marginTop: '30px',
                            overflow: 'hidden',
                            wordBreak: 'break-word'
                        }}>
                            <div style={{ 
                                fontFamily: `var(${font.variable})`, 
                                fontSize: `${fontSize}px`,
                                lineHeight: '1.2',
                                color: 'var(--text-brown)'
                            }}>
                                {sampleText}
                            </div>
                            
                            <div style={{ 
                                marginTop: '20px', 
                                display: 'grid', 
                                gap: '10px',
                                opacity: 0.6
                            }}>
                                <div style={{ fontFamily: `var(${font.variable})`, fontSize: '1.2rem' }}>
                                    ABCDEFGHIJKLMNOPQRSTUVWXYZ
                                </div>
                                <div style={{ fontFamily: `var(${font.variable})`, fontSize: '1.2rem' }}>
                                    abcdefghijklmnopqrstuvwxyz
                                </div>
                                <div style={{ fontFamily: `var(${font.variable})`, fontSize: '1.2rem' }}>
                                    0123456789 !@#$%^&*()_+-=[]{}|;':",./?
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FontVisualizer;
