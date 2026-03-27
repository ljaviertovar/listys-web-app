import { afterEach, describe, expect, it } from 'vitest'

import { ApiServiceError } from '@/lib/api/http'
import { assertDemoActionAllowed } from '@/lib/demo/policy'

const ORIGINAL_ENV = { ...process.env }

describe('demo policy', () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  it('blocks restricted mutations for the configured demo account', () => {
    process.env.DEMO_MODE_ENABLED = 'true'
    process.env.DEMO_USER_EMAIL = 'demo@example.com'

    expect(() => assertDemoActionAllowed({ id: 'demo-user', email: 'demo@example.com' }, 'upload-ticket')).toThrowError(
      ApiServiceError
    )
  })

  it('allows low-cost mutations for the configured demo account', () => {
    process.env.DEMO_MODE_ENABLED = 'true'
    process.env.DEMO_USER_EMAIL = 'demo@example.com'

    expect(() =>
      assertDemoActionAllowed({ id: 'demo-user', email: 'demo@example.com' }, 'update-shopping-session-item')
    ).not.toThrow()
  })

  it('does not apply demo restrictions to regular users', () => {
    process.env.DEMO_MODE_ENABLED = 'true'
    process.env.DEMO_USER_EMAIL = 'demo@example.com'

    expect(() => assertDemoActionAllowed({ id: 'regular-user', email: 'user@example.com' }, 'upload-ticket')).not.toThrow()
  })

  it('rate limits repeated allowed demo mutations', () => {
    process.env.DEMO_MODE_ENABLED = 'true'
    process.env.DEMO_USER_EMAIL = 'demo@example.com'

    for (let i = 0; i < 30; i += 1) {
      assertDemoActionAllowed({ id: 'demo-user', email: 'demo@example.com' }, 'update-base-list-item')
    }

    expect(() => assertDemoActionAllowed({ id: 'demo-user', email: 'demo@example.com' }, 'update-base-list-item')).toThrowError(
      ApiServiceError
    )
  })
})
