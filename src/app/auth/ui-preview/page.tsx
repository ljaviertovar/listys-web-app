'use client'

import { useEffect } from 'react'

import { Header } from '@/components/app'
import useActiveSessionStore from '@/stores/active-session'

export default function Page() {
	useEffect(() => {
		useActiveSessionStore.getState().setActiveSession({ id: 's1', name: 'Items for Dinner' })
	}, [])
	return (
		<div className='flex h-dvh flex-col'>
			<Header />
			<main className='flex-1 bg-sidebar p-4'>
				<div className='h-40 rounded-3xl bg-slate-800' />
			</main>
		</div>
	)
}
