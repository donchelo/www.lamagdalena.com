'use client'

import { ElementType } from 'react'

interface InputProps {
  type?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  name?: string
  id?: string
  required?: boolean
  as?: ElementType
  className?: string
  rows?: number
  disabled?: boolean
}

export default function Input({
  type = 'text', placeholder, value, onChange, name, id,
  required = false, as: Tag = 'input', className = '', rows, disabled,
}: InputProps) {
  return (
    <Tag
      type={Tag === 'input' ? type : undefined}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      name={name}
      id={id}
      required={required}
      className={className}
      rows={rows}
      disabled={disabled}
    />
  )
}
