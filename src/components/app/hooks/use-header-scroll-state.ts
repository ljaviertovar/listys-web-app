'use client'

import { useEffect, useState } from 'react'

const TOP_RESET_THRESHOLD = 16
const DIRECTION_THRESHOLD = 6

export function useHeaderScrollState() {
	const [isScrolled, setIsScrolled] = useState(false)
	const [isHidden, setIsHidden] = useState(false)

	useEffect(() => {
		const scroller = document.querySelector<HTMLElement>('#content > main')
		if (!scroller) return

		let previousScrollTop = scroller.scrollTop
		let accumulatedDelta = 0
		let direction: 'up' | 'down' | null = null
		const desktopQuery = window.matchMedia('(min-width: 64rem)')

		const updateHeader = () => {
			const currentScrollTop = scroller.scrollTop
			setIsScrolled(currentScrollTop > 20)

			if (desktopQuery.matches || currentScrollTop <= TOP_RESET_THRESHOLD) {
				setIsHidden(false)
				accumulatedDelta = 0
				direction = null
			} else {
				const delta = currentScrollTop - previousScrollTop
				const nextDirection = delta > 0 ? 'down' : delta < 0 ? 'up' : null

				if (nextDirection && nextDirection !== direction) {
					direction = nextDirection
					accumulatedDelta = 0
				}

				if (nextDirection) accumulatedDelta += Math.abs(delta)

				if (accumulatedDelta >= DIRECTION_THRESHOLD) {
					setIsHidden(direction === 'down')
					accumulatedDelta = 0
				}
			}

			previousScrollTop = currentScrollTop
		}

		const handleResize = () => {
			if (desktopQuery.matches) setIsHidden(false)
		}

		scroller.addEventListener('scroll', updateHeader, { passive: true })
		window.addEventListener('resize', handleResize, { passive: true })
		updateHeader()

		return () => {
			scroller.removeEventListener('scroll', updateHeader)
			window.removeEventListener('resize', handleResize)
		}
	}, [])

	return { isHidden, isScrolled }
}
