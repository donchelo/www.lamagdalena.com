import React, { useState } from 'react';
import PrivateLayout from '../../../components/templates/PrivateLayout';

const ContentGenerator = () => {
  const [topic, setTopic] = useState('');
  const [strategy, setStrategy] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!topic || !strategy) return;

    setLoading(true);
    // Simulate content generation
    setTimeout(() => {
      setResults([
        { 
          theme: 'Educativo', 
          ideas: [
            '5 mitos sobre el storytelling en 2024',
            'Cómo estructurar una narrativa de marca coherente',
            'La importancia de la autenticidad en el diseño visual'
          ]
        },
        { 
          theme: 'Inspiracional', 
          ideas: [
            'Nuestra historia: De un sótano a La Magdalena',
            'Por qué creemos en el impacto social del cine',
            'El día que una imagen cambió una comunidad'
          ]
        },
        { 
          theme: 'Promocional', 
          ideas: [
            'Conoce nuestro nuevo taller de narrativa estratégica',
            'Caso de éxito: Cómo ayudamos a Marca X a crecer un 40%',
            'Nuevos servicios de consultoría audiovisual'
          ]
        }
      ]);
      setLoading(false);
    }, 1500);
  };

  return (
    <PrivateLayout>
      <header className="private-header">
        <h1>Generador de Ideas de Contenido</h1>
        <p>Define un tema y una estrategia para recibir propuestas estructuradas.</p>
      </header>

      <div className="private-card">
        <form onSubmit={handleGenerate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="label-caps" style={{ display: 'block', marginBottom: '0.5rem' }}>Tema Central</label>
              <input 
                type="text" 
                className="private-input" 
                placeholder="Ej: Sostenibilidad ambiental" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div>
              <label className="label-caps" style={{ display: 'block', marginBottom: '0.5rem' }}>Estrategia</label>
              <input 
                type="text" 
                className="private-input" 
                placeholder="Ej: Posicionamiento como expertos" 
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className="private-button" disabled={loading}>
            {loading ? 'Generando ideas...' : 'Generar Ideas'}
          </button>
        </form>
      </div>

      {results && (
        <div className="tool-grid">
          {results.map((group, idx) => (
            <div key={idx} className="private-card" style={{ marginBottom: 0 }}>
              <h3 style={{ color: 'var(--private-accent)', borderBottom: '1px solid var(--private-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                {group.theme}
              </h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {group.ideas.map((idea, i) => (
                  <li key={i} style={{ padding: '0.8rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
                    • {idea}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </PrivateLayout>
  );
};

export default ContentGenerator;
