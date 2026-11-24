'use client'

import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}
const browserTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone
const serverTimeZone = () => 'UTC'

/** The person's time zone; the server renders in UTC and the browser takes over after hydration, with no mismatch. */
export function useBrowserTimeZone() {
	return useSyncExternalStore(subscribe, browserTimeZone, serverTimeZone)
}
