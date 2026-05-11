'use client'

import React, { useState } from 'react'
import Button from '@/components/atoms/Button'
import Heading from '@/components/atoms/Heading'
import Text from '@/components/atoms/Text'
import Input from '@/components/atoms/Input'
import BlogCard from '@/components/molecules/BlogCard'
import NavLinks from '@/components/molecules/NavLinks'

export default function DesignSystemPage() {
  const [activeTab, setActiveTab] = useState<'tokens' | 'atoms' | 'molecules'>('tokens')

  const colors = [
    { name: '--bg-cream', hex: '#ffffff' },
    { name: '--text-brown', hex: '#5c4a33' },
    { name: '--accent-lime', hex: '#d4ff00' },
  ]

  const typography = [
    { label: 'Heading (Neue Haas Display)', var: '--font-heading', family: 'Neue Haas Display' },
    { label: 'Body (Helvetica Neue Light)', var: '--font-body', family: 'Helvetica Neue Light' },
  ]

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 0' }}>
      <div className="private-header" style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--private-text)', fontFamily: 'var(--font-heading)' }}>
          Molecular Design System
        </h1>
        <p style={{ color: 'var(--private-text-muted)', fontSize: '1.1rem' }}>
          Sistema de diseño de la marca La Magdalena S.A.S BIC.
        </p>
      </div>

      {/* Navegación de pestañas */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', borderBottom: '1px solid var(--private-border)' }}>
        {(['tokens', 'atoms', 'molecules'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '1rem 2rem',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--private-accent)' : '2px solid transparent',
              color: activeTab === tab ? 'var(--private-text)' : 'var(--private-text-muted)',
              fontSize: '1rem',
              fontWeight: activeTab === tab ? 600 : 400,
              textTransform: 'capitalize',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {tab === 'tokens' ? 'Design Tokens' : tab}
          </button>
        ))}
      </div>

      {/* Contenido de pestañas */}
      <div style={{ padding: '0 1rem' }}>
        
        {/* TOKENS */}
        {activeTab === 'tokens' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
            
            <section>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>Brand Colors</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '2rem' }}>
                {colors.map(c => (
                  <div key={c.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ 
                      height: '100px', 
                      backgroundColor: c.hex, 
                      borderRadius: '8px',
                      border: c.hex === '#ffffff' ? '1px solid var(--private-border)' : 'none'
                    }} />
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--private-text)' }}>{c.name}</p>
                      <p style={{ color: 'var(--private-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>{c.hex}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>Typography</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {typography.map(t => (
                  <div key={t.label} style={{ padding: '1.5rem', border: '1px solid var(--private-border)', borderRadius: '8px', backgroundColor: 'var(--private-glass)' }}>
                    <p style={{ color: 'var(--private-text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>{t.label} / <code>{t.var}</code></p>
                    <p style={{ fontFamily: `var(${t.var})`, fontSize: '2rem', color: 'var(--private-text)' }}>
                      Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj
                    </p>
                    <p style={{ fontFamily: `var(${t.var})`, fontSize: '1rem', color: 'var(--private-text)', marginTop: '0.5rem' }}>
                      El rápido zorro marrón salta sobre el perro perezoso. 0123456789
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>Heading Hierarchy</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: 'var(--bg-cream)', padding: '2rem', borderRadius: '8px' }}>
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'gray', marginBottom: '0.5rem' }}>Heading 1 (var(--fs-h1))</p>
                  <Heading level={1} style={{ color: 'var(--text-brown)' }}>The quick brown fox</Heading>
                </div>
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'gray', marginBottom: '0.5rem' }}>Heading 2 (var(--fs-h2))</p>
                  <Heading level={2} style={{ color: 'var(--text-brown)' }}>The quick brown fox</Heading>
                </div>
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'gray', marginBottom: '0.5rem' }}>Heading 3 (var(--fs-h3))</p>
                  <Heading level={3} style={{ color: 'var(--text-brown)' }}>The quick brown fox</Heading>
                </div>
              </div>
            </section>

          </div>
        )}

        {/* ATOMS */}
        {activeTab === 'atoms' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
            
            <section>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>Buttons</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', backgroundColor: 'var(--bg-cream)', padding: '2rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                  <Button variant="primary">Primary Button</Button>
                  <code style={{ fontSize: '0.7rem', color: 'gray' }}>variant="primary"</code>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                  <Button variant="secondary">Secondary Button</Button>
                  <code style={{ fontSize: '0.7rem', color: 'gray' }}>variant="secondary"</code>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                  <Button variant="commercial">Commercial Button</Button>
                  <code style={{ fontSize: '0.7rem', color: 'gray' }}>variant="commercial"</code>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', backgroundColor: '#000', padding: '1rem', borderRadius: '8px' }}>
                  <Button variant="nav">Nav Button</Button>
                  <code style={{ fontSize: '0.7rem', color: 'gray' }}>variant="nav"</code>
                </div>
              </div>
            </section>

            <section>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>Inputs</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', backgroundColor: 'var(--bg-cream)', padding: '2rem', borderRadius: '8px', maxWidth: '500px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'gray', fontFamily: 'var(--font-body)' }}>Standard Input Text</label>
                  <Input placeholder="Enter your text here..." className="contact-input" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'gray', fontFamily: 'var(--font-body)' }}>Textarea (as="textarea")</label>
                  <Input as="textarea" rows={4} placeholder="Type your message..." className="contact-input" />
                </div>
              </div>
            </section>

          </div>
        )}

        {/* MOLECULES */}
        {activeTab === 'molecules' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
            
            <section>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>Blog Card</h2>
              <div style={{ backgroundColor: 'var(--bg-cream)', padding: '2rem', borderRadius: '8px', display: 'flex', gap: '2rem', overflowX: 'auto' }}>
                <div style={{ width: '300px', flexShrink: 0 }}>
                  <BlogCard 
                    title="El Secreto de la Magdalena"
                    category="Cultura"
                    date="Mayo 2026"
                    excerpt="Una historia de tradición y modernidad."
                    image="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=600&auto=format&fit=crop"
                    slug="el-secreto"
                  />
                </div>
                <div style={{ width: '300px', flexShrink: 0 }}>
                  <BlogCard 
                    title="Innovación en el Agro"
                    category="Tecnología"
                    date="Abril 2026"
                    excerpt="Cómo estamos transformando los procesos."
                    image="https://images.unsplash.com/photo-1505471768190-275e2ad7b3f9?q=80&w=600&auto=format&fit=crop"
                    slug="innovacion"
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>Nav Links (Desktop)</h2>
              <div style={{ backgroundColor: '#000', padding: '2rem', borderRadius: '8px', display: 'flex', justifyContent: 'center' }}>
                <NavLinks mobile={false} />
              </div>
            </section>

          </div>
        )}

      </div>
    </div>
  )
}
