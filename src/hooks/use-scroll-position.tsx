'use client'

import { useState, useEffect } from 'react'

export const useScrollPosition = () => {
	const [scrollPosition, setScrollPosition] = useState(0)

	useEffect(() => {
		const updatePosition = () => {
			setScrollPosition(window.pageYOffset)
		}

		// Use passive event listener to avoid blocking scroll performance
		window.addEventListener('scroll', updatePosition, { passive: true })
		updatePosition()
		return () => {
			window.removeEventListener('scroll', updatePosition)
		}
	}, [])

	return scrollPosition
}
