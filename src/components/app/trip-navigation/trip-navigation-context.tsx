'use client'

import { createContext, useContext, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'

type TripRoute = { pathname: string; section: 'lists' | 'trips' } | null
const TripNavigationContext = createContext<{ route: TripRoute; setRoute: Dispatch<SetStateAction<TripRoute>> } | null>(null)

/** Navigation consumes the trip already loaded by the server page; it never fetches the trip again. */
export function TripNavigationProvider({ children }: { children: ReactNode }) {
	const [route, setRoute] = useState<TripRoute>(null)
	const value = useMemo(() => ({ route, setRoute }), [route])
	return <TripNavigationContext.Provider value={value}>{children}</TripNavigationContext.Provider>
}

export const useTripNavigation = () => useContext(TripNavigationContext)
