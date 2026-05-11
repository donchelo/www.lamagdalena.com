'use client'

import React, { useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Button from '@/components/atoms/Button'
import Heading from '@/components/atoms/Heading'

const SUGGESTED_QUESTIONS = [
  "¿Cómo puedo escalar la venta de libros de Jarupia?",
  "¿Qué historia de biodiversidad es la más impactante?",
  "¿Cómo conectar las fotos de Armero con nuevos coleccionistas?",
  "Dáme un consejo estratégico para la curaduría de la próxima colección."
]

export default function AdvisorPage() {
  const { messages, input, handleInputChange, handleSubmit, setInput, isLoading } = useChat({
    api: '/api/advisor/chat',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Bienvenido, buscador de historias. Soy el **Sabio de La Magdalena**. Estoy aquí para asesorarte en la estrategia de este gran proyecto, compartir el alma de nuestras obras y ayudarte a escalar hacia nuevos horizontes. ¿Por dónde deseas empezar nuestro diálogo hoy?'
      }
    ]
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSuggestedClick = (question: string) => {
    setInput(question)
  }

  return (
    <div className="advisor-container">
      <header className="advisor-header">
        <div className="advisor-badge">SABIO IA</div>
        <Heading level={1}>Asesor Estratégico</Heading>
        <p className="advisor-subtitle">El conocimiento profundo de La Magdalena a tu servicio.</p>
      </header>

      <div className="chat-window">
        <div className="messages-list">
          {messages.map((m) => (
            <div key={m.id} className={`message-wrapper ${m.role}`}>
              <div className="message-bubble">
                <div className="message-role-label">
                  {m.role === 'user' ? 'Tú' : 'El Sabio'}
                </div>
                <div className="message-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {m.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <footer className="chat-footer">
        {messages.length === 1 && (
          <div className="suggestions-container">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button 
                key={i} 
                className="suggestion-chip"
                onClick={() => handleSuggestedClick(q)}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="chat-input-wrapper">
          <input
            className="chat-input"
            value={input || ''}
            placeholder="Pregunta lo que sea al Sabio..."
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            variant="commercial" 
            disabled={isLoading || !input?.trim()}
          >
            {isLoading ? '...' : 'Consultar'}
          </Button>
        </form>
      <style jsx>{`
        .advisor-container {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 5rem);
          max-width: 900px;
          margin: 0 auto;
          position: relative;
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.02);
          overflow: hidden;
          border: 1px solid rgba(92, 74, 51, 0.05);
        }

        .advisor-header {
          padding: 3rem 1rem 1.5rem;
          text-align: center;
          background: linear-gradient(to bottom, #fff, #fafafa);
          border-bottom: 1px solid rgba(92, 74, 51, 0.05);
        }

        .advisor-badge {
          display: inline-block;
          background: var(--accent-lime);
          color: black;
          padding: 0.35rem 1.2rem;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.25em;
          border-radius: 4px;
          margin-bottom: 1rem;
          box-shadow: 0 4px 20px rgba(212, 255, 0, 0.4);
          font-family: var(--font-heading);
        }

        .advisor-subtitle {
          color: var(--text-brown);
          font-family: var(--font-body);
          opacity: 0.6;
          font-size: 1rem;
          margin-top: 0.5rem;
          letter-spacing: 0.02em;
        }

        .chat-window {
          flex: 1;
          overflow-y: auto;
          padding: 2.5rem 2rem;
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
          scrollbar-width: none;
          background: #fff;
        }

        .chat-window::-webkit-scrollbar {
          display: none;
        }

        .messages-list {
          display: flex;
          flex-direction: column;
          gap: 3rem;
        }

        .message-wrapper {
          display: flex;
          width: 100%;
          animation: messageSlideIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        @keyframes messageSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .message-wrapper.user {
          justify-content: flex-end;
        }

        .message-bubble {
          max-width: 85%;
          padding: 2rem;
          border-radius: 24px;
          font-family: var(--font-body);
          line-height: 1.8;
          position: relative;
          font-size: 1.05rem;
          letter-spacing: 0.01em;
        }

        .message-wrapper.assistant .message-bubble {
          background: #fdfdfd;
          border: 1px solid rgba(92, 74, 51, 0.08);
          color: var(--text-brown);
          box-shadow: 0 5px 25px rgba(0,0,0,0.01);
          border-bottom-left-radius: 4px;
        }

        .message-wrapper.user .message-bubble {
          background: var(--text-brown);
          color: white;
          border-radius: 24px 24px 4px 24px;
          box-shadow: 0 12px 35px rgba(92, 74, 51, 0.15);
        }

        .message-role-label {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          margin-bottom: 1rem;
          opacity: 0.4;
          font-weight: 800;
          font-family: var(--font-heading);
        }

        .message-wrapper.user .message-role-label {
          color: var(--accent-lime);
          opacity: 1;
          text-align: right;
        }

        .message-content :global(p) {
          margin-bottom: 1.5rem;
        }

        .message-content :global(p:last-child) {
          margin-bottom: 0;
        }

        .message-content :global(strong) {
          color: var(--text-brown);
          font-weight: 700;
          box-shadow: inset 0 -8px 0 var(--accent-lime);
        }

        .message-wrapper.user .message-content :global(strong) {
          color: var(--accent-lime);
          box-shadow: none;
        }

        .message-content :global(ul), .message-content :global(ol) {
          margin-left: 1.5rem;
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
        }

        .message-content :global(li::marker) {
          color: var(--accent-lime);
        }

        .message-wrapper.user .message-content :global(li::marker) {
          color: white;
        }

        .chat-footer {
          padding: 2.5rem;
          background: #ffffff;
          border-top: 1px solid rgba(92, 74, 51, 0.05);
        }

        .suggestions-container {
          display: flex;
          gap: 1rem;
          overflow-x: auto;
          padding-bottom: 1.5rem;
          scrollbar-width: none;
        }

        .suggestion-chip {
          white-space: nowrap;
          padding: 0.75rem 1.5rem;
          background: transparent;
          border: 1px solid rgba(92, 74, 51, 0.15);
          border-radius: 100px;
          font-size: 0.95rem;
          color: var(--text-brown);
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: var(--font-body);
        }

        .suggestion-chip:hover {
          border-color: var(--accent-lime);
          background: var(--accent-lime);
          color: black;
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(212, 255, 0, 0.25);
        }

        .chat-input-wrapper {
          display: flex;
          gap: 1rem;
          background: #fafafa;
          padding: 0.8rem;
          border: 1px solid rgba(92, 74, 51, 0.1);
          border-radius: 100px;
          transition: all 0.4s ease;
        }

        .chat-input-wrapper:focus-within {
          border-color: var(--text-brown);
          background: #fff;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        }

        .chat-input {
          flex: 1;
          border: none;
          background: transparent;
          padding: 0.5rem 1.5rem;
          font-family: var(--font-body);
          font-size: 1.1rem;
          color: var(--text-brown);
          outline: none;
        }

        .chat-input:disabled {
          opacity: 0.5;
        }
      `}</style>
        </footer>
    </div>
  )
}
