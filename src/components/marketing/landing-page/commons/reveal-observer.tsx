'use client'

import { useEffect } from 'react'

/**
 * Reveals every `[data-reveal]` block of the landing as it scrolls into view. It only arms the hidden state (the
 * `reveal-on` class on the root) once it runs and motion is allowed, so the page is fully visible without JavaScript.
 */
export function RevealObserver() {
	useEffect(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return

		const root = document.documentElement
		const blocks = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
		const viewportBottom = window.innerHeight

		// Blocks already on screen at load stay put, so nothing above the fold flickers.
		for (const block of blocks) {
			if (block.getBoundingClientRect().top < viewportBottom) block.dataset.shown = ''
		}
		root.classList.add('reveal-on')

		const observer = new IntersectionObserver(
			entries => {
				for (const entry of entries) {
					if (!entry.isIntersecting) continue
					;(entry.target as HTMLElement).dataset.shown = ''
					observer.unobserve(entry.target)
				}
			},
			{ rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
		)
		for (const block of blocks) {
			if (!('shown' in block.dataset)) observer.observe(block)
		}

		return () => {
			observer.disconnect()
			root.classList.remove('reveal-on')
		}
	}, [])

	return null
}
