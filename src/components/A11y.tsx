import React from 'react'

export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      {label}
    </div>
  )
}

export function ErrorNotice({ message }: { message: string }) {
  if (!message) return null
  return (
    <div role="alert" style={{ color: 'crimson' }}>
      {message}
    </div>
  )
}


