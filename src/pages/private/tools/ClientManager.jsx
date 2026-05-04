import React, { useState } from 'react';
import PrivateLayout from '../../../components/templates/PrivateLayout';

const ClientManager = () => {
  const [clients, setClients] = useState([
    { id: 1, name: 'Cliente A', docs: ['contrato.pdf', 'brief.docx'] },
    { id: 2, name: 'Cliente B', docs: ['logo.svg'] }
  ]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedClient) return;

    const newMessage = { text: inputMessage, sender: 'user' };
    setChatMessages([...chatMessages, newMessage]);
    setInputMessage('');

    // Simulate AI response
    setTimeout(() => {
      const response = { 
        text: `Basado en los documentos de ${selectedClient.name}, la respuesta es que estamos trabajando en la estrategia de contenido para el próximo trimestre.`, 
        sender: 'ai' 
      };
      setChatMessages(prev => [...prev, response]);
    }, 1000);
  };

  return (
    <PrivateLayout>
      <header className="private-header">
        <h1>Gestión de Clientes</h1>
        <p>Carga documentos y chatea con la inteligencia sobre cada cliente.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
        <div className="private-card">
          <h3 style={{ marginBottom: '1rem' }}>Mis Clientes</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {clients.map(client => (
              <li 
                key={client.id} 
                onClick={() => setSelectedClient(client)}
                style={{ 
                  padding: '0.8rem', 
                  cursor: 'pointer', 
                  borderRadius: '8px',
                  backgroundColor: selectedClient?.id === client.id ? 'rgba(238, 241, 81, 0.1)' : 'transparent',
                  color: selectedClient?.id === client.id ? 'var(--private-accent)' : 'inherit',
                  marginBottom: '0.5rem'
                }}
              >
                {client.name}
              </li>
            ))}
          </ul>
          <button className="private-button" style={{ width: '100%', marginTop: '1rem' }}>+ Nuevo Cliente</button>
        </div>

        <div>
          {selectedClient ? (
            <>
              <div className="private-card">
                <h3>Documentos de {selectedClient.name}</h3>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  {selectedClient.docs.map((doc, idx) => (
                    <div key={idx} style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '0.8rem' }}>
                      📄 {doc}
                    </div>
                  ))}
                  <button style={{ color: 'var(--private-accent)', fontSize: '0.8rem' }}>+ Cargar Documento</button>
                </div>
              </div>

              <div className="private-card">
                <h3>Chat con {selectedClient.name}</h3>
                <div className="chat-container">
                  {chatMessages.length === 0 ? (
                    <p style={{ textAlign: 'center', opacity: 0.5, marginTop: 'auto', marginBottom: 'auto' }}>
                      Pregunta algo sobre este cliente...
                    </p>
                  ) : (
                    chatMessages.map((msg, idx) => (
                      <div key={idx} className={`chat-message ${msg.sender}`}>
                        {msg.text}
                      </div>
                    ))
                  )}
                </div>
                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <input 
                    type="text" 
                    className="private-input" 
                    placeholder="Escribe tu mensaje..." 
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    style={{ marginBottom: 0 }}
                  />
                  <button type="submit" className="private-button">Enviar</button>
                </form>
              </div>
            </>
          ) : (
            <div className="private-card" style={{ textAlign: 'center', padding: '5rem' }}>
              <p>Selecciona un cliente para comenzar.</p>
            </div>
          )}
        </div>
      </div>
    </PrivateLayout>
  );
};

export default ClientManager;
