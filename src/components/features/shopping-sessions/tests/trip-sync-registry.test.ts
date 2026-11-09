import { afterEach, expect, it, vi } from 'vitest'
import { toast } from 'sonner'
import { getShoppingSession } from '@/lib/api/endpoints/shopping-sessions'
import { createTripSyncRegistry } from '../sync/trip-sync-registry'
import type { SessionItemDto } from '@/lib/validations/shopping-session-item'

vi.mock('sonner', () => ({ toast: { info: vi.fn() } }))
vi.mock('@/lib/api/endpoints/shopping-sessions', () => ({ getShoppingSession: vi.fn(), toggleShoppingSessionItem: vi.fn() }))
vi.mock('@/lib/supabase/client', () => ({ createClient: () => {
  const channel = { on: vi.fn().mockReturnThis(), subscribe: vi.fn().mockReturnThis() }
  return { channel: () => channel, removeChannel: vi.fn() }
} }))

afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks() })

it('reports unavailable pending work once even if route refresh redirects away', async () => {
  vi.stubGlobal('window', { localStorage: { getItem: () => null, setItem: vi.fn(), removeItem: vi.fn() } })
  vi.mocked(getShoppingSession).mockResolvedValue({ error: 'Not found', status: 404 })
  const registry = createTripSyncRegistry('owner')
  const entry = registry.get('trip')
  entry.hydrate()
  const item = { id: '00000000-0000-4000-8000-000000000001', shopping_session_id: 'trip', checked: false, version: 1 } as SessionItemDto
  entry.receive([item])
  entry.queue(item.id, true)
  registry.start('trip')
  await entry.refresh()
  await entry.refresh()
  expect(entry.store.getState().conflicts[item.id].reason).toBe('unavailable')
  expect(toast.info).toHaveBeenCalledOnce()
  registry.dispose()
})
