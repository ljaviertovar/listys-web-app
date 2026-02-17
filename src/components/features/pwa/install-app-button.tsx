'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { DownloadIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

type InstallOutcome = 'accepted' | 'dismissed'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: InstallOutcome; platform: string }>
}

function isIosSafari() {
  if (typeof window === 'undefined') return false

  const ua = window.navigator.userAgent.toLowerCase()
  const isIos = /iphone|ipad|ipod/.test(ua)
  const isSafari = /safari/.test(ua) && !/crios|fxios|edgios/.test(ua)

  return isIos && isSafari
}

function isAndroid() {
  if (typeof window === 'undefined') return false
  return /android/.test(window.navigator.userAgent.toLowerCase())
}

function isMobileDevice() {
  if (typeof window === 'undefined') return false
  return /android|iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase())
}

function isStandalone() {
  if (typeof window === 'undefined') return false

  const mediaStandalone = window.matchMedia('(display-mode: standalone)').matches
  const navigatorStandalone = 'standalone' in window.navigator && Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)

  return mediaStandalone || navigatorStandalone
}

export function InstallAppButton() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    setInstalled(isStandalone())

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as BeforeInstallPromptEvent)
    }

    const handleAppInstalled = () => {
      setInstalled(true)
      setInstallEvent(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const showManualHint = useMemo(
    () => !installed && !installEvent && isMobileDevice(),
    [installed, installEvent],
  )

  if (installed) return null
  if (!installEvent && !showManualHint) return null

  const onClick = async () => {
    if (installEvent) {
      await installEvent.prompt()
      const choice = await installEvent.userChoice
      if (choice.outcome === 'accepted') {
        setInstallEvent(null)
      }
      return
    }

    if (!window.isSecureContext) {
      toast.message('Secure context required', {
        description: 'Open the app over HTTPS to enable installation on mobile.',
      })
      return
    }

    if (isIosSafari()) {
      toast.message('Install on iPhone', {
        description: 'Tap Share and then "Add to Home Screen".',
      })
      return
    }

    if (isAndroid()) {
      toast.message('Install on Android', {
        description: 'Open browser menu and tap "Install app" or "Add to Home screen".',
      })
      return
    }

    toast.message('Install app', {
      description: 'Use your browser install option from the menu.',
    })
  }

  return (
    <Button
      variant='outline'
      size='sm'
      onClick={onClick}
      aria-label='Install app'
      className='mr-2'
    >
      <DownloadIcon />
      Install
    </Button>
  )
}
