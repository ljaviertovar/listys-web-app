import { User } from '@supabase/supabase-js'

type UserLike = Pick<User, 'id' | 'email'> | { id?: string | null; email?: string | null }

function normalizeEmail(value?: string | null) {
  return value?.trim().toLowerCase() || ''
}

export function isDemoModeEnabled() {
  return process.env.DEMO_MODE_ENABLED === 'true'
}

export function isDemoModeVisible() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE_ENABLED === 'true') return true
  return isDemoModeEnabled()
}

export function getDemoUserEmail() {
  return normalizeEmail(process.env.DEMO_USER_EMAIL)
}

export function getDemoUserPassword() {
  return process.env.DEMO_USER_PASSWORD?.trim() || ''
}

export function getDemoUserId() {
  return process.env.DEMO_USER_ID?.trim() || ''
}

export function getDemoResetSecret() {
  return process.env.DEMO_RESET_SECRET?.trim() || ''
}

export function isDemoUser(user: UserLike | null | undefined) {
  if (!user || !isDemoModeEnabled()) return false

  const configuredId = getDemoUserId()
  const configuredEmail = getDemoUserEmail()
  const userEmail = normalizeEmail(user.email)

  if (configuredId && user.id === configuredId) return true
  if (configuredEmail && userEmail === configuredEmail) return true

  return false
}

export function assertDemoSignInConfigured() {
  if (!isDemoModeEnabled()) {
    throw new Error('Demo mode is disabled.')
  }

  if (!getDemoUserEmail() || !getDemoUserPassword()) {
    throw new Error('Missing DEMO_USER_EMAIL or DEMO_USER_PASSWORD.')
  }
}

export function assertDemoResetConfigured() {
  if (!isDemoModeEnabled()) {
    throw new Error('Demo mode is disabled.')
  }

  if (!getDemoResetSecret()) {
    throw new Error('Missing DEMO_RESET_SECRET.')
  }
}
