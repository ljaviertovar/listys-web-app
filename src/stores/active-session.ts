import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

export type ActiveSession = { id: string; name?: string } | null

interface ActiveSessionState {
  activeSession: ActiveSession
  isLoaded: boolean
  setActiveSession: (s: ActiveSession) => void
  clearActiveSession: () => void
}

export const useActiveSessionStore = create<ActiveSessionState>(set => ({
  activeSession: null,
  isLoaded: false,
  setActiveSession: s => set({ activeSession: s, isLoaded: true }),
  clearActiveSession: () => set({ activeSession: null }),
}))

export default useActiveSessionStore

// Initialize client-side: fetch initial active session (no Realtime, MVP)
export async function initActiveSession() {
  try {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user
    if (!user) {
      useActiveSessionStore.getState().setActiveSession(null)
      return
    }

    // No user_id filter: RLS restricts to sessions the user owns OR is a collaborator on.
    const { data: run } = await supabase
      .from('shopping_sessions')
      .select('id, name')
      .eq('status', 'active')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (run) {
      useActiveSessionStore.getState().setActiveSession({ id: run.id, name: run.name })
    } else {
      useActiveSessionStore.getState().setActiveSession(null)
    }
  } catch (e) {
    console.error('initActiveSession error', e)
    useActiveSessionStore.getState().setActiveSession(null)
  }
}
