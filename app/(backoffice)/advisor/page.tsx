'use client'

import React, { useRef, useEffect, useState, useMemo } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const SUGGESTED_QUESTIONS = [
  "¿Cómo puedo escalar la venta de libros de Jarupia?",
  "¿Qué historia de biodiversidad es la más impactante?",
  "¿Cómo conectar las fotos de Armero con nuevos coleccionistas?",
  "Dáme un consejo estratégico para la curaduría de la próxima colección."
]

const MODELS = [
  { id: 'claude-opus-4-7', name: 'Claude Opus 4.7 (Estratégico)', provider: 'Anthropic' },
  { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6 (Veloz)', provider: 'Anthropic' },
  { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5 (Liviano)', provider: 'Anthropic' },
]

const WELCOME_TEXT = 'Bienvenido, buscador de historias. Soy el **Sabio de La Magdalena**. Estoy aquí para asesorarte en la estrategia de este gran proyecto, compartir el alma de nuestras obras y ayudarte a escalar hacia nuevos horizontes. ¿Por dónde deseas empezar nuestro diálogo hoy?'

const welcomeMessage: UIMessage = {
  id: 'welcome',
  role: 'assistant',
  parts: [{ type: 'text', text: WELCOME_TEXT }],
}

function getMessageText(msg: { parts: Array<{ type: string; text?: string }> }): string {
  return msg.parts
    .filter(p => p.type === 'text')
    .map(p => p.text ?? '')
    .join('')
}

export default function AdvisorPage() {
  const [mounted, setMounted] = useState(false)
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id)
  const [input, setInput] = useState('')
  const [showHistory, setShowHistory] = useState(true)
  const [chats, setChats] = useState<any[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)

  const modelRef = useRef(selectedModel)
  useEffect(() => { modelRef.current = selectedModel }, [selectedModel])

  const transport = useMemo(() => new DefaultChatTransport({
    api: '/api/advisor/chat',
    body: () => ({ model: modelRef.current }),
  }), [])

  const { messages, sendMessage, status, setMessages } = useChat({
    transport,
    messages: [welcomeMessage],
  })

  const isLoading = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('sabio-chats-v2')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) setChats(parsed)
      } catch (e) {
        console.error('Error loading chats', e)
      }
    }
  }, [])

  const saveChatToLocal = (currentMessages: typeof messages) => {
    if (!currentMessages || currentMessages.length <= 1) return
    const firstUser = currentMessages.find(m => m.role === 'user')
    if (!firstUser) return

    const chatTitle = getMessageText(firstUser).substring(0, 30) + '...'
    const chatId = currentChatId || `chat-${Date.now()}`

    const chatData = {
      id: chatId,
      title: chatTitle,
      messages: currentMessages,
      model: selectedModel,
      updatedAt: new Date().toISOString(),
    }

    setChats(prev => {
      const updated = [...prev]
      const index = updated.findIndex(c => c.id === chatId)
      if (index >= 0) {
        updated[index] = { ...updated[index], ...chatData, title: updated[index].title }
      } else {
        updated.unshift(chatData)
      }
      localStorage.setItem('sabio-chats-v2', JSON.stringify(updated))
      return updated
    })

    if (!currentChatId) setCurrentChatId(chatId)
  }

  useEffect(() => {
    if (!isLoading && messages.length > 1) {
      saveChatToLocal(messages)
    }
  }, [isLoading, messages.length])

  const handleSend = () => {
    const text = input.trim()
    if (!text || isLoading) return
    const fullText = attachedDoc
      ? `[DOCUMENTO ADJUNTO: ${attachedDoc.name}]\n\`\`\`\n${attachedDoc.content.slice(0, 12000)}\n\`\`\`\n\n${text}`
      : text
    setInput('')
    setAttachedDoc(null)
    sendMessage({ text: fullText })
  }

  const handleNewChat = () => {
    setMessages([welcomeMessage])
    setCurrentChatId(null)
    setInput('')
  }

  const loadChat = (chat: any) => {
    if (!chat?.messages) return
    setCurrentChatId(chat.id)
    setMessages(chat.messages)
    setSelectedModel(chat.model || MODELS[0].id)
    setInput('')
  }

  const deleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const filtered = chats.filter(c => c.id !== id)
    setChats(filtered)
    localStorage.setItem('sabio-chats-v2', JSON.stringify(filtered))
    if (currentChatId === id) handleNewChat()
  }

  const [attachedDoc, setAttachedDoc] = useState<{ name: string; content: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const content = ev.target?.result as string
      setAttachedDoc({ name: file.name, content })
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  const handleSuggestedClick = (question: string) => {
    setInput(question)
    setTimeout(() => textareaRef.current?.focus(), 0)
  }

  if (!mounted) return null

  return (
    <div className="advisor-pro-layout">
      {/* Sidebar de Historial */}
      <aside className={`advisor-history-sidebar ${showHistory ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={handleNewChat}>
            <span>+</span> Nuevo Diálogo
          </button>
        </div>
        <div className="history-list">
          <div className="history-group">Conversaciones Guardadas</div>
          {chats.length === 0 && (
            <div className="empty-history">No hay chats guardados aún.</div>
          )}
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`history-item ${currentChatId === chat.id ? 'active' : ''}`}
              onClick={() => loadChat(chat)}
            >
              <span className="history-icon">✦</span>
              <span className="history-text">{chat.title}</span>
              <button className="delete-chat-btn" onClick={(e) => deleteChat(chat.id, e)}>×</button>
            </div>
          ))}
        </div>
        <div className="sidebar-footer">
          <div className="user-badge">
            <div className="user-avatar">AD</div>
            <div className="user-info">
              <span className="user-name">Administrador</span>
              <span className="user-plan">Plan Local MVP</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Área Principal de Chat */}
      <div className="advisor-main-chat">
        <header className="chat-top-nav">
          <div className="top-nav-left">
            <button
              className="toggle-sidebar-btn"
              onClick={() => setShowHistory(!showHistory)}
              title={showHistory ? 'Ocultar historial' : 'Mostrar historial'}
            >
              {showHistory ? '«' : '☰'}
            </button>
            <div className="chat-info">
              <span className="chat-title">Sabio IA: Asesoría Estratégica</span>
              <span className="chat-status">Listo para asesorar</span>
            </div>
          </div>
          <div className="top-nav-right">
            <div className="model-selector-wrapper">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="model-select"
              >
                {MODELS.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <div className="chat-scroller">
          <div className="chat-content-container">
            {messages.map((m) => (
              <div key={m.id} className={`chat-row ${m.role}`}>
                <div className="avatar-wrapper">
                  {m.role === 'user' ? 'D' : 'S'}
                </div>
                <div className="message-content-wrapper">
                  <div className="message-header">
                    {m.role === 'user' ? 'Dirección' : 'El Sabio'}
                  </div>
                  <div className="message-body">
                    {m.parts.map((part, idx) => {
                      if (part.type !== 'text') return null
                      return (
                        <ReactMarkdown key={idx} remarkPlugins={[remarkGfm]}>
                          {part.text}
                        </ReactMarkdown>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chat-row assistant">
                <div className="avatar-wrapper">S</div>
                <div className="message-content-wrapper">
                  <div className="message-header">El Sabio</div>
                  <div className="message-body loading">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <footer className="chat-input-area">
          <div className="chat-input-container">
            {messages.length === 1 && !input && (
              <div className="welcome-suggestions">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button key={i} className="mini-suggestion" onClick={() => handleSuggestedClick(q)}>
                    {q}
                  </button>
                ))}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.csv,.json,.pdf"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />

            {attachedDoc && (
              <div className="attached-doc-pill">
                <span className="doc-icon">📄</span>
                <span className="doc-name">{attachedDoc.name}</span>
                <button className="doc-remove" onClick={() => setAttachedDoc(null)}>×</button>
              </div>
            )}

            <div className="pro-input-form">
              <button
                type="button"
                className="attach-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Adjuntar documento"
              >
                ⊕
              </button>
              <textarea
                ref={textareaRef}
                className="pro-textarea"
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Escribe un mensaje estratégico..."
                autoFocus
              />
              <button
                type="button"
                className="pro-send-btn"
                disabled={isLoading || !input.trim()}
                onClick={handleSend}
                title="Enviar consulta"
              >
                {isLoading ? '...' : '↑'}
              </button>
            </div>
            <div className="input-footer-info">
              {MODELS.find(m => m.id === selectedModel)?.name} · Finanzas Q1 2026 · Narrativa La Magdalena
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        .advisor-pro-layout {
          display: flex;
          height: calc(100vh - 4.5rem);
          margin: -2rem -3rem;
          background: #ffffff;
          overflow: hidden;
          position: relative;
        }

        /* SIDEBAR */
        .advisor-history-sidebar {
          width: 280px;
          background: #fcfbf9;
          border-right: 1px solid var(--private-border);
          display: flex;
          flex-direction: column;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s ease;
          z-index: 30;
        }

        .advisor-history-sidebar.closed {
          width: 0;
          transform: translateX(-100%);
        }

        .sidebar-header {
          padding: 1.5rem;
        }

        .new-chat-btn {
          width: 100%;
          padding: 0.8rem;
          background: white;
          border: 1px solid var(--private-border);
          border-radius: 12px;
          font-weight: 600;
          color: var(--private-text);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .new-chat-btn:hover {
          border-color: var(--private-accent);
          background: rgba(212, 255, 0, 0.05);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .history-list {
          flex: 1;
          overflow-y: auto;
          padding: 0.5rem;
        }

        .history-group {
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--private-text-muted);
          padding: 1.5rem 1rem 0.5rem;
        }

        .history-item {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 0.8rem 1rem;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: var(--private-text);
          font-size: 0.9rem;
          position: relative;
        }

        .history-item:hover {
          background: rgba(0,0,0,0.04);
        }

        .history-item.active {
          background: rgba(212, 255, 0, 0.12);
          color: black;
          font-weight: 600;
        }

        .history-text {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .delete-chat-btn {
          opacity: 0;
          background: none;
          border: none;
          color: #ef4444;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .history-item:hover .delete-chat-btn {
          opacity: 0.6;
        }

        .delete-chat-btn:hover {
          opacity: 1 !important;
          background: rgba(239, 68, 68, 0.1);
        }

        .empty-history {
          padding: 2rem 1.5rem;
          text-align: center;
          font-size: 0.8rem;
          color: var(--private-text-muted);
          font-style: italic;
        }

        .history-icon {
          color: var(--private-accent);
          font-size: 0.8rem;
        }

        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid var(--private-border);
        }

        .user-badge {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 0.8rem;
          border-radius: 12px;
          background: white;
          border: 1px solid var(--private-border);
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          background: var(--private-text);
          color: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 800;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--private-text);
        }

        .user-plan {
          font-size: 0.65rem;
          color: var(--private-accent);
          font-weight: 800;
        }

        /* MAIN CHAT AREA */
        .advisor-main-chat {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: white;
          position: relative;
          min-width: 0;
        }

        .chat-top-nav {
          height: 64px;
          border-bottom: 1px solid var(--private-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          z-index: 20;
          position: sticky;
          top: 0;
        }

        .top-nav-left {
          display: flex;
          align-items: center;
          gap: 1.2rem;
        }

        .toggle-sidebar-btn {
          background: #f5f5f5;
          border: 1px solid var(--private-border);
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--private-text);
          transition: all 0.2s ease;
        }

        .toggle-sidebar-btn:hover {
          background: white;
          border-color: var(--private-accent);
        }

        .chat-info {
          display: flex;
          flex-direction: column;
        }

        .chat-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--private-text);
        }

        .chat-status {
          font-size: 0.7rem;
          color: #10b981;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .chat-status::before {
          content: '';
          width: 6px;
          height: 6px;
          background: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
        }

        .model-select {
          background: #ffffff;
          border: 1px solid var(--private-border);
          padding: 0.5rem 1rem;
          border-radius: 100px;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--private-text);
          outline: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .model-select:hover {
          border-color: var(--private-accent);
        }

        /* CHAT CONTENT */
        .chat-scroller {
          flex: 1;
          overflow-y: auto;
          padding: 3rem 0;
          scroll-behavior: smooth;
        }

        .chat-content-container {
          max-width: 850px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .chat-row {
          display: flex;
          gap: 1.8rem;
          margin-bottom: 3.5rem;
          animation: slideUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .avatar-wrapper {
          width: 36px;
          height: 36px;
          background: var(--private-text);
          color: white;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.9rem;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .chat-row.assistant .avatar-wrapper {
          background: var(--private-accent);
          color: black;
          box-shadow: 0 4px 15px rgba(212, 255, 0, 0.3);
        }

        .message-content-wrapper {
          flex: 1;
          min-width: 0;
        }

        .message-header {
          font-size: 0.7rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-bottom: 0.8rem;
          color: var(--private-text-muted);
        }

        .message-body {
          font-family: var(--font-body);
          line-height: 1.8;
          font-size: 1.1rem;
          color: var(--private-text);
        }

        .message-body :global(p) { margin-bottom: 1.5rem; }
        .message-body :global(p:last-child) { margin-bottom: 0; }

        .message-body :global(strong) {
          color: black;
          font-weight: 800;
          background: linear-gradient(180deg, transparent 70%, rgba(212, 255, 0, 0.5) 70%);
        }

        /* TYPING INDICATOR */
        .loading { display: flex; gap: 6px; padding: 15px 0; }
        .typing-dot {
          width: 8px;
          height: 8px;
          background: var(--private-accent);
          border-radius: 50%;
          animation: typingPulse 1.4s infinite;
          opacity: 0.5;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typingPulse {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-6px); opacity: 1; }
        }

        /* INPUT AREA */
        .chat-input-area {
          padding: 2.5rem 1.5rem;
          background: linear-gradient(to top, white 85%, transparent);
          z-index: 10;
        }

        .chat-input-container {
          max-width: 850px;
          margin: 0 auto;
          position: relative;
        }

        .welcome-suggestions {
          display: flex;
          gap: 0.8rem;
          flex-wrap: wrap;
          margin-bottom: 1.8rem;
          justify-content: center;
        }

        .mini-suggestion {
          padding: 0.6rem 1.2rem;
          background: white;
          border: 1px solid var(--private-border);
          border-radius: 100px;
          font-size: 0.85rem;
          color: var(--private-text);
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }

        .mini-suggestion:hover {
          border-color: var(--private-accent);
          background: var(--private-accent);
          color: black;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(212, 255, 0, 0.2);
        }

        .attached-doc-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(212, 255, 0, 0.12);
          border: 1px solid rgba(212, 255, 0, 0.4);
          border-radius: 100px;
          padding: 0.4rem 0.8rem;
          margin-bottom: 0.75rem;
          width: fit-content;
        }

        .doc-icon { font-size: 0.9rem; }

        .doc-name {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--private-text);
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .doc-remove {
          background: none;
          border: none;
          color: var(--private-text-muted);
          font-size: 1.1rem;
          cursor: pointer;
          padding: 0;
          line-height: 1;
          opacity: 0.6;
          transition: opacity 0.2s;
        }

        .doc-remove:hover { opacity: 1; }

        .attach-btn {
          width: 36px;
          height: 36px;
          background: #f5f5f5;
          border: 1px solid var(--private-border);
          border-radius: 10px;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--private-text-muted);
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .attach-btn:hover {
          background: white;
          border-color: var(--private-accent);
          color: var(--private-text);
        }

        .pro-input-form {
          display: flex;
          align-items: flex-end;
          gap: 1rem;
          background: #ffffff;
          border: 1.5px solid var(--private-border);
          border-radius: 24px;
          padding: 1rem;
          box-shadow: 0 8px 30px rgba(0,0,0,0.04);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .pro-input-form:focus-within {
          border-color: var(--private-accent);
          box-shadow: 0 15px 45px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }

        .pro-textarea {
          flex: 1;
          border: none;
          background: transparent;
          padding: 0.8rem 0.5rem;
          font-family: var(--font-body);
          font-size: 1.1rem;
          color: var(--private-text);
          outline: none;
          resize: none;
          max-height: 250px;
          line-height: 1.6;
        }

        .pro-send-btn {
          width: 42px;
          height: 42px;
          background: var(--private-text);
          color: white;
          border: none;
          border-radius: 14px;
          font-size: 1.4rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .pro-send-btn:hover:not(:disabled) {
          background: black;
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 8px 20px rgba(0,0,0,0.2);
        }

        .pro-send-btn:disabled {
          opacity: 0.15;
          cursor: not-allowed;
          box-shadow: none;
        }

        .input-footer-info {
          text-align: center;
          font-size: 0.65rem;
          color: var(--private-text-muted);
          margin-top: 1.5rem;
          letter-spacing: 0.1em;
          font-weight: 700;
          text-transform: uppercase;
        }

        @media (max-width: 1024px) {
          .advisor-history-sidebar {
            position: absolute;
            height: 100%;
            left: 0;
            top: 0;
            box-shadow: 20px 0 50px rgba(0,0,0,0.1);
          }
          .advisor-pro-layout {
            margin: -2rem -1rem;
          }
        }
      `}</style>
    </div>
  )
}
