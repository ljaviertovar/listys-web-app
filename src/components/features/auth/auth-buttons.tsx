'use client'

import { type ComponentProps, type ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { UserNav } from './user-nav'

type Props = {
	/** Replaces the default call to action shown to signed-out visitors. */
	signedOut?: ReactNode
}

export default function AuthButtons({ signedOut }: Props) {
	const [user, setUser] = useState<ComponentProps<typeof UserNav>['user'] | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const supabase = createClient()

		const getUser = async () => {
			const { data } = await supabase.auth.getClaims()
			const user = data?.claims
			setUser(user ?? null)
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
			) : signedOut ? (
				signedOut
			) : (
				// Only show Sign Up when not authenticated
				<div className='flex items-center gap-4'>
					<Button
						size='primary'
						rounded='md'
						// The landing header keeps the lighter weight and the 4px corner it had before the app's A1 buttons.
						weight='medium'
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
