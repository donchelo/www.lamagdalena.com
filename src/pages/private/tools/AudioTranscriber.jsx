import React, { useState } from 'react';
import PrivateLayout from '../../../components/templates/PrivateLayout';

const AudioTranscriber = () => {
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTranscribe = (e) => {
    e.preventDefault();
    if (!file) return;

    setIsProcessing(true);
    // Simulate transcription
    setTimeout(() => {
      setTranscript(`[00:00] Entrevistador: Bienvenidos a un nuevo episodio de La Magdalena. Hoy tenemos a un invitado especial...
[00:15] Invitado: Muchas gracias por la invitación. Es un placer estar aquí hablando de narrativas de impacto.
[00:45] Entrevistador: El tema central hoy es cómo las historias pueden cambiar la realidad social de las comunidades rurales.
[01:10] Invitado: Absolutamente. La representación es el primer paso para la visibilización y el cambio sistémico.`);
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <PrivateLayout>
      <header className="private-header">
        <h1>Transcriptor de Audio</h1>
        <p>Carga audios y obtén transcripciones literales de forma automática.</p>
      </header>

      <div className="private-card">
        <div 
          style={{ 
            border: '2px dashed var(--private-border)', 
            borderRadius: '16px', 
            padding: '4rem 2rem', 
            textAlign: 'center',
            backgroundColor: 'rgba(255,255,255,0.02)',
            cursor: 'pointer'
          }}
          onClick={() => document.getElementById('audio-input').click()}
        >
          <input 
            id="audio-input"
            type="file" 
            accept="audio/*" 
            style={{ display: 'none' }}
            onChange={(e) => setFile(e.target.files[0])}
          />
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🎙️</span>
          <h3>{file ? file.name : 'Haz clic para cargar un audio'}</h3>
          <p style={{ opacity: 0.5 }}>MP3, WAV, M4A (Max 100MB)</p>
          {file && (
            <button 
              className="private-button" 
              style={{ marginTop: '2rem' }}
              onClick={(e) => { e.stopPropagation(); handleTranscribe(e); }}
              disabled={isProcessing}
            >
              {isProcessing ? 'Procesando audio...' : 'Comenzar Transcripción'}
            </button>
          )}
        </div>
      </div>

      {transcript && (
        <div className="private-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Transcripción Finalizada</h3>
            <button style={{ color: 'var(--private-accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
              Descargar .txt
            </button>
          </div>
          <div style={{ 
            background: 'rgba(0,0,0,0.3)', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            lineHeight: '1.6',
            fontSize: '0.9rem'
          }}>
            {transcript}
          </div>
        </div>
      )}
    </PrivateLayout>
  );
};

export default AudioTranscriber;
