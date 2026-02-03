'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useActiveSessionStore } from '@/stores/active-session'

export function ActiveSessionProvider({ children }: { children: React.ReactNode }) {
	const setActiveSession = useActiveSessionStore(s => s.setActiveSession)
	const clearActiveSession = useActiveSessionStore(s => s.clearActiveSession)

	useEffect(() => {
		let mounted = true
		const supabase = createClient()

		const load = async () => {
			try {
				const { data: userData } = await supabase.auth.getUser()
				const user = userData?.user
				if (!user) return

				// initial load
				const { data: run } = await supabase
					.from('shopping_sessions')
					.select('id, name, status')
					.eq('user_id', user.id)
					.eq('status', 'active')
					.maybeSingle()

				if (mounted && run) setActiveSession({ id: run.id, name: run.name })

				// realtime subscription: listen for inserts/updates/deletes on shopping_sessions for this user
				const channel = supabase
					.channel(`active_session_user_${user.id}`)
					.on(
						'postgres_changes',
						{ event: '*', schema: 'public', table: 'shopping_sessions', filter: `user_id=eq.${user.id}` },
						payload => {
							try {
								const newRow = (payload as any).new
								const oldRow = (payload as any).old

								// INSERT or UPDATE -> if status is active, set it
								if (newRow && newRow.status === 'active') {
									setActiveSession({ id: newRow.id, name: newRow.name })
									return
								}

								// UPDATE where it was active and now not -> clear
								if (oldRow && oldRow.status === 'active' && (!newRow || newRow.status !== 'active')) {
									clearActiveSession()
									return
								}

								// DELETE of active
								if (!newRow && oldRow && oldRow.status === 'active') {
									clearActiveSession()
									return
								}
							} catch (e) {
								console.debug('ActiveSession subscription handler error', e)
							}
						},
					)
					.subscribe()

				return () => {
					mounted = false
					try {
						supabase.removeChannel(channel)
					} catch {
						channel.unsubscribe().catch(() => {})
					}
				}
			} catch (e) {
				console.error('ActiveSessionProvider load error', e)
			}
		}

		load()
	}, [setActiveSession, clearActiveSession])

	return <>{children}</>
}

export default ActiveSessionProvider
