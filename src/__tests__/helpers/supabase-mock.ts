import { vi } from 'vitest'

/**
 * Creates a chainable Supabase query builder mock.
 * Every method returns `this` so chaining works, and
 * the terminal methods (single, maybeSingle, then) resolve the configured result.
 */
export function createQueryBuilder(result: { data?: any; error?: any; count?: number | null } = {}) {
  const builder: any = {
    _result: result,
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockImplementation(() => Promise.resolve(result)),
    maybeSingle: vi.fn().mockImplementation(() => Promise.resolve(result)),
    then: vi.fn().mockImplementation((resolve: any) => resolve(result)),
  }
  return builder
}

/**
 * Creates a `from()` mock that returns different query builders
 * for sequential calls to the same table. Useful when an action
 * queries the same table multiple times (count → dedup → insert).
 *
 * Usage:
 * ```ts
 * supabase.from = sequentialFrom({
 *   groups: [
 *     { count: 0, error: null },  // 1st call — limit check
 *     { data: null, error: null }, // 2nd call — dedup check
 *     { data: { id: '1' }, error: null }, // 3rd call — insert
 *   ],
 * })
 * ```
 */
export function sequentialFrom(
  plan: Record<string, Array<{ data?: any; error?: any; count?: number | null }>>
) {
  const callCounts: Record<string, number> = {}
  return vi.fn().mockImplementation((table: string) => {
    if (plan[table]) {
      callCounts[table] = (callCounts[table] ?? 0) + 1
      const idx = Math.min(callCounts[table] - 1, plan[table].length - 1)
      return createQueryBuilder(plan[table][idx])
    }
    return createQueryBuilder({ data: null, error: null })
  })
}

/**
 * Creates a full Supabase client mock.
 *
 * Usage:
 * ```ts
 * const { supabase, fromMocks } = createSupabaseMock({
 *   user: { id: 'user-1' },
 *   tables: {
 *     groups: { data: [...], error: null },
 *   }
 * })
 * ```
 */
export function createSupabaseMock(opts: {
  user?: { id: string } | null
  tables?: Record<string, { data?: any; error?: any; count?: number | null }>
  rpcResults?: Record<string, { data?: any; error?: any }>
  storageResults?: {
    remove?: { data?: any; error?: any }
    createSignedUrl?: { data?: any; error?: any }
  }
} = {}) {
  const { user = { id: 'test-user-id' }, tables = {}, rpcResults = {}, storageResults = {} } = opts

  const fromMocks: Record<string, ReturnType<typeof createQueryBuilder>> = {}

  for (const [table, result] of Object.entries(tables)) {
    fromMocks[table] = createQueryBuilder(result)
  }

  const supabase = {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
      }),
    },
    from: vi.fn().mockImplementation((table: string) => {
      if (fromMocks[table]) return fromMocks[table]
      // Return a default builder that resolves to empty
      const defaultBuilder = createQueryBuilder({ data: null, error: null })
      fromMocks[table] = defaultBuilder
      return defaultBuilder
    }),
    rpc: vi.fn().mockImplementation((funcName: string) => {
      const result = rpcResults[funcName] ?? { data: null, error: null }
      return Promise.resolve(result)
    }),
    storage: {
      from: vi.fn().mockReturnValue({
        remove: vi.fn().mockResolvedValue(storageResults.remove ?? { data: null, error: null }),
        createSignedUrl: vi.fn().mockResolvedValue(
          storageResults.createSignedUrl ?? { data: { signedUrl: 'https://signed-url.test' }, error: null }
        ),
      }),
    },
  }

  return { supabase, fromMocks }
}

/**
 * Sets up module mocks for server action testing.
 * Call this inside vi.mock() callbacks or beforeAll.
 */
export function mockServerDeps(supabaseMock: any) {
  return {
    '@/lib/supabase/server': {
      createClient: vi.fn().mockResolvedValue(supabaseMock),
    },
    'next/cache': {
      revalidatePath: vi.fn(),
    },
  }
}

export const TEST_USER_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
export const TEST_UUID = '550e8400-e29b-41d4-a716-446655440000'
export const TEST_UUID_2 = '6ba7b810-9dad-41d4-80b4-00c04fd430c8'
export const TEST_UUID_3 = '7c9e6679-7425-40de-944b-e07fc1f90ae7'
