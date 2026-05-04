import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/private.css';

const PrivateLayout = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { label: 'Panel Principal', path: '/private', icon: '🏠' },
    { label: 'Gestión de Clientes', path: '/private/clients', icon: '👥' },
    { label: 'Generador de Ideas', path: '/private/content', icon: '💡' },
    { label: 'Transcriptor de Audio', path: '/private/audio', icon: '🎙️' },
  ];

  return (
    <div className="private-dashboard">
      <aside className="private-sidebar">
        <Link to="/private" className="private-sidebar-logo">
          LM <span>Private</span>
        </Link>
        <nav className="private-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`private-nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div style={{ marginTop: 'auto' }}>
          <Link to="/" className="private-nav-link">
            <span>🔙</span>
            <span>Volver al Sitio Público</span>
          </Link>
        </div>
      </aside>
      <main className="private-content-wrapper">
        {children}
      </main>
    </div>
  );
};

export default PrivateLayout;
