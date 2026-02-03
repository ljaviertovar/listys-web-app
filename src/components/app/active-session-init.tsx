'use client'

import { useEffect } from 'react'
import { initActiveSession } from '@/stores/active-session'

export default function ActiveSessionInit() {
	useEffect(() => {
		initActiveSession()
	}, [])

	return null
}
