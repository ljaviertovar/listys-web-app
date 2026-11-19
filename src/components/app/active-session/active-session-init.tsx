'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { initActiveSession } from '@/stores/active-session'

export default function ActiveSessionInit() {
	const pathname = usePathname()
	useEffect(() => {
		initActiveSession()
	}, [pathname])

	return null
}
