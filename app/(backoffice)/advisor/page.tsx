'use client'

import { ChatUI } from "@/components/chat/ChatUI"

export default function AdvisorPage() {
  return (
    <div style={{
      margin: '-2rem -3rem',
      height: 'calc(100dvh - 4.5rem)',
      overflow: 'hidden',
    }}>
      <ChatUI api="/api/advisor/chat" />
    </div>
  )
}
