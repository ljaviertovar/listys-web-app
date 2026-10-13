'use client'

import { useEffect, useState } from 'react'

import { createClient } from '@/lib/supabase/client'

const SIGNED_URL_TTL_SECONDS = 60 * 60

interface TicketImageUrls {
	urls: string[]
	loading: boolean
	error: string | null
}

interface Loaded {
	/** The paths these URLs were signed for, so a result that no longer matches the request is not shown. */
	key: string
	urls: string[]
	error: string | null
}

const NO_URLS: string[] = []

/**
 * Signs the storage paths of a receipt's photos. The row, the full-screen viewer and the compare view all show the same
 * photos, so they share one set of signed URLs instead of each asking storage again.
 */
export function useTicketImageUrls(imagePaths: string[]): TicketImageUrls {
	// The server hands over a fresh array every render; the paths themselves are what identify the request.
	const pathsKey = imagePaths.join('|')
	const [loaded, setLoaded] = useState<Loaded | null>(null)

	useEffect(() => {
		if (!pathsKey) return

		let mounted = true

		const loadAll = async () => {
			try {
				const supabase = createClient()
				const signed = await Promise.all(
					pathsKey.split('|').map(async path => {
						const { data, error } = await supabase.storage.from('tickets').createSignedUrl(path, SIGNED_URL_TTL_SECONDS)
						if (error || !data?.signedUrl) {
							console.error('Error creating signed URL for', path, error)
							return null
						}
						return data.signedUrl
					}),
				)
				if (mounted) setLoaded({ key: pathsKey, urls: signed.filter((url): url is string => url !== null), error: null })
			} catch (err) {
				console.error('Error loading images:', err)
				if (mounted) setLoaded({ key: pathsKey, urls: [], error: 'Failed to load images' })
			}
		}

		loadAll()

		return () => {
			mounted = false
		}
	}, [pathsKey])

	if (!pathsKey) return { urls: NO_URLS, loading: false, error: null }
	if (loaded?.key !== pathsKey) return { urls: NO_URLS, loading: true, error: null }
	return { urls: loaded.urls, loading: false, error: loaded.error }
}
