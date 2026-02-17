'use client'

import { useEffect } from 'react'

export function PwaRegister() {
  useEffect(() => {
    const shouldRegister =
      process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_PWA_DEV === 'true'
    if (!shouldRegister) return
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('Service worker registration failed', error)
    })
  }, [])

  return null
}
