'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

const MIN_VISIBLE_MS = 350
const MAX_VISIBLE_MS = 30_000
const COMPLETION_VISIBLE_MS = 250

export function useNavigationProgress() {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const routeKey = `${pathname}?${searchParams.toString()}`
	const [isPending, startTransition] = useTransition()
	const [isVisible, setIsVisible] = useState(false)
	const [progress, setProgress] = useState(0)
	const finished = useRef(false)
	const startedAt = useRef(0)
	const startingRoute = useRef(routeKey)

	useEffect(() => {
		function handleNavigation(event: MouseEvent) {
			if (
				event.defaultPrevented ||
				event.button !== 0 ||
				event.metaKey ||
				event.ctrlKey ||
				event.shiftKey ||
				event.altKey ||
				!(event.target instanceof Element)
			) {
				return
			}

			const link = event.target.closest<HTMLAnchorElement>('a[href]')
			if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return

			const destination = new URL(link.href, window.location.href)
			if (destination.origin !== window.location.origin) return

			const currentPath = `${window.location.pathname}${window.location.search}`
			const destinationPath = `${destination.pathname}${destination.search}`
			if (destinationPath === currentPath) return

			event.preventDefault()
			startedAt.current = Date.now()
			startingRoute.current = routeKey
			finished.current = false
			setProgress(10)
			setIsVisible(true)
			startTransition(() => router.push(`${destination.pathname}${destination.search}${destination.hash}`))
		}

		document.addEventListener('click', handleNavigation, true)
		return () => document.removeEventListener('click', handleNavigation, true)
	}, [routeKey, router, startTransition])

	useEffect(() => {
		if (!isVisible || routeKey === startingRoute.current || isPending) return

		const remaining = Math.max(MIN_VISIBLE_MS - (Date.now() - startedAt.current), 0)
		let hideTimeout: number | undefined
		const timeout = window.setTimeout(() => {
			finished.current = true
			setProgress(100)
			hideTimeout = window.setTimeout(() => setIsVisible(false), COMPLETION_VISIBLE_MS)
		}, remaining)
		return () => {
			window.clearTimeout(timeout)
			window.clearTimeout(hideTimeout)
		}
	}, [isPending, isVisible, routeKey])

	useEffect(() => {
		if (!isVisible) return

		const timeout = window.setTimeout(() => setIsVisible(false), MAX_VISIBLE_MS)
		// Route loading has no measurable percentage; reserve completion for the route commit.
		const interval = window.setInterval(() => {
			if (!finished.current) setProgress(current => Math.min(90, current + (90 - current) * 0.12))
		}, 200)
		return () => {
			window.clearTimeout(timeout)
			window.clearInterval(interval)
		}
	}, [isVisible])

	return { isVisible, progress }
}
