'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { classifyPhoto, type PhotoVerdict } from '../helpers/classify-photo'

export interface PhotoPreview {
	id: string
	file: File
	url: string
}

export interface PhotoRejection {
	id: string
	name: string
	reason: Exclude<PhotoVerdict, 'ok'>
}

/**
 * The photos chosen for a receipt: the accepted ones with a preview each, and the ones that were left out with the reason, so
 * the form can say which file failed instead of a toast that disappears.
 */
export function usePhotoPicker(max: number) {
	const [previews, setPreviews] = useState<PhotoPreview[]>([])
	const [rejections, setRejections] = useState<PhotoRejection[]>([])
	// Object URLs are released when a photo is removed and when the form goes away.
	const liveUrls = useRef(new Set<string>())

	useEffect(() => {
		const urls = liveUrls.current
		return () => {
			urls.forEach(url => URL.revokeObjectURL(url))
			urls.clear()
		}
	}, [])

	const addFiles = useCallback(
		(incoming: FileList | File[]) => {
			const files = Array.from(incoming)
			const slots = max - previews.length

			if (slots <= 0) {
				toast.error(`Maximum ${max} images allowed`)
				return
			}
			if (files.length > slots) {
				toast.warning(`Only ${slots} more image(s) can be added`)
			}

			const accepted: PhotoPreview[] = []
			const refused: PhotoRejection[] = []
			for (const file of files.slice(0, slots)) {
				const verdict = classifyPhoto(file)
				if (verdict === 'ok') {
					const url = URL.createObjectURL(file)
					liveUrls.current.add(url)
					accepted.push({ id: crypto.randomUUID(), file, url })
				} else {
					refused.push({ id: crypto.randomUUID(), name: file.name, reason: verdict })
				}
			}

			if (accepted.length > 0) setPreviews(prev => [...prev, ...accepted])
			// A new attempt replaces the earlier complaints instead of piling them up.
			setRejections(refused)
		},
		[max, previews.length],
	)

	const removePhoto = useCallback((id: string) => {
		setPreviews(prev => {
			const removed = prev.find(photo => photo.id === id)
			if (removed) {
				URL.revokeObjectURL(removed.url)
				liveUrls.current.delete(removed.url)
			}
			return prev.filter(photo => photo.id !== id)
		})
	}, [])

	const dismissRejection = useCallback((id: string) => {
		setRejections(prev => prev.filter(rejection => rejection.id !== id))
	}, [])

	return { previews, rejections, addFiles, removePhoto, dismissRejection }
}
