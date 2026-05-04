'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const networks = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'twitter', label: 'Twitter / X' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'youtube', label: 'YouTube' },
]

export default function SocialListeningPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    clientName: '',
    dateFrom: '',
    dateTo: '',
    keywords: [] as string[],
    hashtags: [] as string[],
    accounts: [] as string[],
    selectedNetworks: [] as string[],
  })

  const [keywordInput, setKeywordInput] = useState('')
  const [hashtagInput, setHashtagInput] = useState('')
  const [accountInput, setAccountInput] = useState('')

  const addTag = (field: 'keywords' | 'hashtags' | 'accounts', value: string, setValue: (v: string) => void) => {
    const trimmed = value.trim()
    if (!trimmed) return
    setForm(prev => ({ ...prev, [field]: [...prev[field], trimmed] }))
    setValue('')
  }

  const removeTag = (field: 'keywords' | 'hashtags' | 'accounts', index: number) => {
    setForm(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }))
  }

  const toggleNetwork = (id: string) => {
    setForm(prev => ({
      ...prev,
      selectedNetworks: prev.selectedNetworks.includes(id)
        ? prev.selectedNetworks.filter(n => n !== id)
        : [...prev.selectedNetworks, id],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Auto-agregar lo que esté en los inputs pero no se haya confirmado con "+"
    const finalKeywords = [...form.keywords]
    if (keywordInput.trim()) finalKeywords.push(keywordInput.trim())
    
    const finalHashtags = [...form.hashtags]
    if (hashtagInput.trim()) finalHashtags.push(hashtagInput.trim())
    
    const finalAccounts = [...form.accounts]
    if (accountInput.trim()) finalAccounts.push(accountInput.trim())

    if (form.selectedNetworks.length === 0) {
      setError('Selecciona al menos una red social.')
      return
    }
    
    if (finalKeywords.length === 0 && finalHashtags.length === 0 && finalAccounts.length === 0) {
      setError('Agrega al menos una keyword, hashtag o cuenta a monitorear.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          keywords: finalKeywords,
          hashtags: finalHashtags,
          accounts: finalAccounts
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      const { reportId } = await res.json()
      router.push(`/social-listening/${reportId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el reporte.')
      setIsSubmitting(false)
    }
  }

  const TagInput = ({ label, tags, input, setInput, field }: {
    label: string
    tags: string[]
    input: string
    setInput: (v: string) => void
    field: 'keywords' | 'hashtags' | 'accounts'
  }) => (
    <div className="form-group">
      <label>{label}</label>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(field, input, setInput) } }}
          placeholder="Escribe y presiona Enter"
          style={{ flex: 1 }}
        />
        <button type="button" onClick={() => addTag(field, input, setInput)} style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--private-accent)', color: 'var(--private-bg)', border: 'none', borderRadius: '2px', cursor: 'pointer', fontWeight: 700 }}>+</button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {tags.map((tag, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.7rem', backgroundColor: 'rgba(238,241,81,0.15)', border: '1px solid var(--private-accent)', borderRadius: '2px', fontSize: '0.85rem', color: 'var(--private-accent)' }}>
            {tag}
            <button type="button" onClick={() => removeTag(field, i)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, fontSize: '1rem', lineHeight: 1 }}>×</button>
          </span>
        ))}
      </div>
    </div>
  )

  return (
    <div className="private-main">
      <div className="private-header">
        <h1 className="private-title">Nuevo Reporte de Social Listening</h1>
        <p className="private-subtitle">Genera un análisis de 8 páginas con datos de redes sociales</p>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: '760px', marginTop: '2.5rem' }}>
        <div className="form-group">
          <label>Cliente / Marca *</label>
          <input
            type="text"
            required
            value={form.clientName}
            onChange={e => setForm(p => ({ ...p, clientName: e.target.value }))}
            placeholder="Ej: La Magdalena, ISA, Presentes..."
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="form-group">
            <label>Fecha inicio *</label>
            <input type="date" required value={form.dateFrom} onChange={e => setForm(p => ({ ...p, dateFrom: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Fecha fin *</label>
            <input type="date" required value={form.dateTo} onChange={e => setForm(p => ({ ...p, dateTo: e.target.value }))} />
          </div>
        </div>

        <TagInput label="Keywords" tags={form.keywords} input={keywordInput} setInput={setKeywordInput} field="keywords" />
        <TagInput label="Hashtags" tags={form.hashtags} input={hashtagInput} setInput={setHashtagInput} field="hashtags" />
        <TagInput label="Cuentas a monitorear (opcional)" tags={form.accounts} input={accountInput} setInput={setAccountInput} field="accounts" />

        <div className="form-group">
          <label>Redes sociales *</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
            {networks.map(n => (
              <button
                key={n.id}
                type="button"
                onClick={() => toggleNetwork(n.id)}
                style={{
                  padding: '0.6rem 1.2rem',
                  border: `1px solid ${form.selectedNetworks.includes(n.id) ? 'var(--private-accent)' : 'rgba(255,255,255,0.2)'}`,
                  borderRadius: '2px',
                  backgroundColor: form.selectedNetworks.includes(n.id) ? 'rgba(238,241,81,0.15)' : 'transparent',
                  color: form.selectedNetworks.includes(n.id) ? 'var(--private-accent)' : 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease',
                }}
              >
                {n.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ padding: '1rem', backgroundColor: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: '4px', color: '#ff5050', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '1rem 3rem',
            backgroundColor: isSubmitting ? 'rgba(238,241,81,0.4)' : 'var(--private-accent)',
            color: 'var(--private-bg)',
            border: 'none',
            borderRadius: '2px',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: '0.95rem',
            letterSpacing: '0.1em',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
          }}
        >
          {isSubmitting ? 'Generando...' : 'GENERAR REPORTE'}
        </button>
      </form>
    </div>
  )
}
