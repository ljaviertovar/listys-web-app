import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createQueryBuilder } from '@/test/helpers'

// Mock the client-side Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/lib/supabase/client'
import { useActiveSessionStore, initActiveSession } from '@/stores/active-session'

const mockedCreateClient = vi.mocked(createClient)

beforeEach(() => {
  // Reset store to initial state
  useActiveSessionStore.setState({ sessions: [], activeSession: null, otherCount: 0, isLoaded: false })
})

describe('useActiveSessionStore', () => {
  it('starts with null session and isLoaded false', () => {
    const { activeSession, isLoaded } = useActiveSessionStore.getState()
    expect(activeSession).toBeNull()
    expect(isLoaded).toBe(false)
  })

  it('setActiveSession updates session and marks loaded', () => {
    useActiveSessionStore.getState().setActiveSession({ id: 's-1', name: 'Trip' })
    const { activeSession, isLoaded } = useActiveSessionStore.getState()
    expect(activeSession).toMatchObject({ id: 's-1', name: 'Trip' })
    expect(isLoaded).toBe(true)
  })

  it('setActiveSession with null marks loaded true', () => {
    useActiveSessionStore.getState().setActiveSession(null)
    const { activeSession, isLoaded } = useActiveSessionStore.getState()
    expect(activeSession).toBeNull()
    expect(isLoaded).toBe(true)
  })

  it('derives the newest active session and counts the others', () => {
    useActiveSessionStore.getState().setSessions([
      { id: 'older', name: 'Older', started_at: '2026-01-01T00:00:00Z' },
      { id: 'newer', name: 'Newer', started_at: '2026-01-02T00:00:00Z' },
    ])
    const { sessions, activeSession, otherCount } = useActiveSessionStore.getState()
    expect(sessions.map(session => session.id)).toEqual(['newer', 'older'])
    expect(activeSession?.id).toBe('newer')
    expect(otherCount).toBe(1)
  })

  it('removes only the completed session', () => {
    useActiveSessionStore.getState().setSessions([{ id: 'one' }, { id: 'two' }])
    useActiveSessionStore.getState().clearActiveSession('one')
    expect(useActiveSessionStore.getState().sessions.map(session => session.id)).toEqual(['two'])
    expect(useActiveSessionStore.getState().otherCount).toBe(0)
  })

  it('clearActiveSession resets session but keeps isLoaded', () => {
    useActiveSessionStore.getState().setActiveSession({ id: 's-1' })
    useActiveSessionStore.getState().clearActiveSession()
    const { activeSession, isLoaded } = useActiveSessionStore.getState()
    expect(activeSession).toBeNull()
    // clearActiveSession does NOT reset isLoaded
    expect(isLoaded).toBe(true)
  })
})

describe('initActiveSession', () => {
  it('sets session when active session exists', async () => {
    const sessionData = [{ id: 'session-1', name: 'Shopping Trip', base_list_id: 'l1', started_at: '2026-01-02T00:00:00Z' }]
    const builder = createQueryBuilder({ data: sessionData, error: null })

    mockedCreateClient.mockReturnValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: vi.fn().mockReturnValue(builder),
    } as unknown as ReturnType<typeof createClient>)

    await initActiveSession()

    const { activeSession, isLoaded } = useActiveSessionStore.getState()
    expect(activeSession).toEqual(sessionData[0])
    expect(isLoaded).toBe(true)
  })

  it('sets null when no active session', async () => {
    const builder = createQueryBuilder({ data: [], error: null })

    mockedCreateClient.mockReturnValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: vi.fn().mockReturnValue(builder),
    } as unknown as ReturnType<typeof createClient>)

    await initActiveSession()

    const { activeSession, isLoaded } = useActiveSessionStore.getState()
    expect(activeSession).toBeNull()
    expect(isLoaded).toBe(true)
  })

  it('sets null when user is not authenticated', async () => {
    mockedCreateClient.mockReturnValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      from: vi.fn(),
    } as unknown as ReturnType<typeof createClient>)

    await initActiveSession()

    const { activeSession, isLoaded } = useActiveSessionStore.getState()
    expect(activeSession).toBeNull()
    expect(isLoaded).toBe(true)
  })

  it('handles errors gracefully', async () => {
    mockedCreateClient.mockReturnValue({
      auth: { getUser: vi.fn().mockRejectedValue(new Error('network error')) },
      from: vi.fn(),
    } as unknown as ReturnType<typeof createClient>)

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

    await initActiveSession()

    const { activeSession, isLoaded } = useActiveSessionStore.getState()
    expect(activeSession).toBeNull()
    // isLoaded is set via setActiveSession in catch block
    expect(isLoaded).toBe(true)
    expect(consoleSpy).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })
})
