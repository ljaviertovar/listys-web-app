'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlayCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface DemoSigninButtonProps {
  onError: (message: string | null) => void
}

export default function DemoSigninButton({ onError }: DemoSigninButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDemoSignIn = async () => {
    onError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/v1/demo/sign-in', {
        method: 'POST',
        credentials: 'include',
      })

      const payload = (await response.json().catch(() => null)) as
        | { data?: { redirect_to?: string } }
        | { error?: { message?: string } }
        | null

      if (!response.ok) {
        const message =
          'error' in (payload || {}) && payload?.error?.message
            ? payload.error.message
            : 'Unable to sign in to the public demo right now.'
        onError(message)
        return
      }

      router.push(('data' in (payload || {}) && payload?.data?.redirect_to) || '/dashboard')
      router.refresh()
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Unable to sign in to the public demo right now.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type='button'
      variant='default'
      disabled={loading}
      className='w-full h-11 text-base font-semibold rounded-xl'
      onClick={handleDemoSignIn}
    >
      {loading ? (
        <div className='flex items-center gap-2'>
          <span className='h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent' />
          Entering demo...
        </div>
      ) : (
        <div className='flex items-center gap-2'>
          <PlayCircle className='h-4 w-4' />
          Enter Demo
        </div>
      )}
    </Button>
  )
}
