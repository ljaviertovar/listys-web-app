import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

export type ActiveSessionSummary = { id: string; name?: string; base_list_id?: string; started_at?: string | null }
export type ActiveSession = ActiveSessionSummary | null

interface ActiveSessionState {
	sessions: ActiveSessionSummary[]
  activeSession: ActiveSession
	otherCount: number
  isLoaded: boolean
  setActiveSession: (s: ActiveSession) => void
	setSessions: (sessions: ActiveSessionSummary[]) => void
  clearActiveSession: (id?: string) => void
}

function withDerivedSessions(sessions: ActiveSessionSummary[], isLoaded = true) {
	const ordered = [...sessions].sort((a, b) => (b.started_at ?? '').localeCompare(a.started_at ?? ''))
	return { sessions: ordered, activeSession: ordered[0] ?? null, otherCount: Math.max(0, ordered.length - 1), isLoaded }
}

export const useActiveSessionStore = create<ActiveSessionState>((set, get) => ({
	sessions: [],
  activeSession: null,
	otherCount: 0,
  isLoaded: false,
	setSessions: sessions => set(withDerivedSessions(sessions)),
	setActiveSession: session => {
		if (!session) {
			set(withDerivedSessions([]))
			return
		}
		const sessions = get().sessions.filter(existing => existing.id !== session.id)
		set(withDerivedSessions([{ ...session, started_at: session.started_at ?? new Date().toISOString() }, ...sessions]))
	},
	clearActiveSession: (id?: string) => {
		const sessions = id ? get().sessions.filter(session => session.id !== id) : []
		set(withDerivedSessions(sessions))
	},
}))

export default useActiveSessionStore

// Initialize client-side: fetch initial active session (no Realtime, MVP)
export async function initActiveSession() {
  try {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user
    if (!user) {
      useActiveSessionStore.getState().setSessions([])
      return
    }

    // No user_id filter: RLS restricts to sessions the user owns OR is a collaborator on.
    const { data: run } = await supabase
      .from('shopping_sessions')
      .select('id, name, base_list_id, started_at')
      .eq('status', 'active')
      .order('started_at', { ascending: false })
      .limit(100)

    useActiveSessionStore.getState().setSessions(run ?? [])
  } catch (e) {
    console.error('initActiveSession error', e)
    useActiveSessionStore.getState().setSessions([])
  }
}
