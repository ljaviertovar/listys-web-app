'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { UserNav } from './user-nav'

export default function AuthButtons() {
	const [user, setUser] = useState<any>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const supabase = createClient()

		const getUser = async () => {
			const { data } = await supabase.auth.getClaims()
			const user = data?.claims
			setUser(user)
			setLoading(false)
		}

		getUser()

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null)
		})

		return () => subscription.unsubscribe()
	}, [])

	if (loading) {
		return (
			<div className='flex justify-end gap-4'>
				<Skeleton className='h-9 w-9 rounded-full' />
			</div>
		)
	}

	return (
		<div className='flex justify-end gap-4'>
			{user ? (
				<UserNav user={user} />
			) : (
				// Only show Sign Up when not authenticated
				<div className='flex items-center gap-4'>
					<Button
						size={'sm'}
						className='bg-primary text-primary-foreground hover:bg-primary/90'
					>
						<Link
							href='/auth/signup'
							className='flex items-center gap-2'
						>
							Get Started
						</Link>
					</Button>
				</div>
			)}
		</div>
	)
}
