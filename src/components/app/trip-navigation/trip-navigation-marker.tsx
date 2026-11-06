'use client'

import { useEffect } from 'react'
import { useTripNavigation } from './trip-navigation-context'

/** No DOM: this server-page marker only tells the surrounding navigation which section owns the trip. */
export function TripNavigationMarker({ completed, pathname }: { completed: boolean; pathname: string }) {
	const navigation = useTripNavigation()
	const setRoute = navigation?.setRoute
	useEffect(() => {
		setRoute?.({ pathname, section: completed ? 'trips' : 'lists' })
		return () => setRoute?.(current => current?.pathname === pathname ? null : current)
	}, [completed, pathname, setRoute])
	return null
}
