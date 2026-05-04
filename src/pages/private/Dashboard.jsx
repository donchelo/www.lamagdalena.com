import React from 'react';
import { Link } from 'react-router-dom';
import PrivateLayout from '../../components/templates/PrivateLayout';

const Dashboard = () => {
  const tools = [
    {
      title: 'Gestión de Clientes',
      description: 'Carga documentos de tus clientes y mantén un chat inteligente con su información específica.',
      path: '/private/clients',
      icon: '👥'
    },
    {
      title: 'Generador de Ideas',
      description: 'Ingresa un tema y una estrategia para recibir ideas de contenido organizadas temáticamente.',
      path: '/private/content',
      icon: '💡'
    },
    {
      title: 'Transcriptor de Audio',
      description: 'Convierte tus grabaciones y audios directamente en texto estructurado y listo para usar.',
      path: '/private/audio',
      icon: '🎙️'
    }
  ];

  return (
    <PrivateLayout>
      <header className="private-header">
        <h1>Bienvenido al Panel Privado</h1>
        <p>Selecciona una herramienta para comenzar a trabajar.</p>
      </header>

      <div className="tool-grid">
        {tools.map((tool) => (
          <Link key={tool.path} to={tool.path} className="tool-card">
            <span style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }}>{tool.icon}</span>
            <h3>{tool.title}</h3>
            <p>{tool.description}</p>
          </Link>
        ))}
      </div>
    </PrivateLayout>
  );
};

export default Dashboard;
