import { useState, useCallback } from 'react'
import type { ToastProps } from '@/components/ui/toast'

interface ToastEntry extends ToastProps {
  id: string
  title: string
  description?: string
}

let _setToasts: React.Dispatch<React.SetStateAction<ToastEntry[]>> | null = null

// Module-level so toast() can be called from anywhere without prop drilling
export function _registerSetter(
  fn: React.Dispatch<React.SetStateAction<ToastEntry[]>>
) {
  _setToasts = fn
}

export function toast(opts: Omit<ToastEntry, 'id'>) {
  if (!_setToasts) return
  const id = Math.random().toString(36).slice(2)
  _setToasts((prev) => [...prev, { ...opts, id }])
}

export function useToastState() {
  const [toasts, setToasts] = useState<ToastEntry[]>([])

  const register = useCallback((fn: typeof setToasts) => {
    _registerSetter(fn)
  }, [])

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return { toasts, setToasts, register, dismiss }
}
