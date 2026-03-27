import { afterEach, describe, expect, it } from 'vitest'

import {
  getDemoUserEmail,
  isDemoModeEnabled,
  isDemoModeVisible,
  isDemoUser,
} from '@/lib/demo/config'

const ORIGINAL_ENV = { ...process.env }

describe('demo config', () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  it('detects demo mode when enabled', () => {
    process.env.DEMO_MODE_ENABLED = 'true'

    expect(isDemoModeEnabled()).toBe(true)
  })

  it('normalizes the configured demo email', () => {
    process.env.DEMO_USER_EMAIL = ' Demo@Example.com '

    expect(getDemoUserEmail()).toBe('demo@example.com')
  })

  it('matches the demo user by email when demo mode is enabled', () => {
    process.env.DEMO_MODE_ENABLED = 'true'
    process.env.DEMO_USER_EMAIL = 'demo@example.com'

    expect(isDemoUser({ id: 'user-1', email: 'demo@example.com' })).toBe(true)
    expect(isDemoUser({ id: 'user-2', email: 'other@example.com' })).toBe(false)
  })

  it('makes demo visibility available from the public env mirror', () => {
    process.env.NEXT_PUBLIC_DEMO_MODE_ENABLED = 'true'

    expect(isDemoModeVisible()).toBe(true)
  })
})
