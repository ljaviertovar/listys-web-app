'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

import { Button } from '@/components/ui/button'
import { UserNav } from './user-nav'

export default async function AuthButtons() {
	const supabase = createClient()
	const { data } = await supabase.auth.getClaims()

	const user = data?.claims

	// if (loading) {
	// 	return (
	// 		<div className='flex justify-end gap-4'>
	// 			<div className='h-9 w-9 animate-pulse rounded-full bg-muted' />
	// 		</div>
	// 	)
	// }

	return (
		<div className='flex justify-end gap-4'>
			{user ? (
				<UserNav user={user} />
			) : (
				<>
					<Button
						size={'sm'}
						variant={'secondary'}
						asChild
					>
						<Link href='/auth/signin'>Sign In</Link>
					</Button>
					<Button
						size={'sm'}
						asChild
						className='text-foreground'
					>
						<Link href='/auth/signup'>Sign Up</Link>
					</Button>
				</>
			)}
		</div>
	)
}
