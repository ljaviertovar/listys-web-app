import { useCallback, useEffect, useState } from 'react'

import { loadReceiptScanner } from '../receipt-scanner-engine'

const CAMERA_REQUEST_TIMEOUT_MS = 15_000

export function useReceiptCamera(reviewing: boolean, onExit: (message?: string) => void) {
	const [stream, setStream] = useState<MediaStream | null>(null)
	const [ready, setReady] = useState(false)

	const stopCamera = useCallback(() => {
		stream?.getTracks().forEach(track => track.stop())
		setStream(null)
	}, [stream])

	useEffect(() => {
		if (reviewing) return
		let cancelled = false
		if (!navigator.mediaDevices?.getUserMedia) {
			onExit('Camera scanning is not available in this browser. Choose photos from your device instead.')
			return
		}

		// Some browsers leave getUserMedia pending until a permission prompt is answered.
		const cameraRequestTimeout = window.setTimeout(() => {
			if (cancelled) return
			cancelled = true
			onExit('The camera took too long to open. Choose photos from your device instead.')
		}, CAMERA_REQUEST_TIMEOUT_MS)

		void navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false })
			.then(nextStream => {
				window.clearTimeout(cameraRequestTimeout)
				if (cancelled) {
					nextStream.getTracks().forEach(track => track.stop())
					return
				}
				setStream(nextStream)
			})
			.catch(() => {
				window.clearTimeout(cameraRequestTimeout)
				if (cancelled) return
				cancelled = true
				onExit('The camera could not be opened. Allow camera access or choose photos from your device.')
			})

		return () => {
			cancelled = true
			window.clearTimeout(cameraRequestTimeout)
		}
	}, [onExit, reviewing])

	useEffect(() => () => stream?.getTracks().forEach(track => track.stop()), [stream])

	useEffect(() => {
		if (!stream || ready || reviewing) return
		let cancelled = false
		void loadReceiptScanner().then(
			() => { if (!cancelled) setReady(true) },
			() => { if (!cancelled) onExit('The receipt scanner could not load. Choose photos from your device instead.') },
		)
		return () => { cancelled = true }
	}, [onExit, ready, reviewing, stream])

	return { stream, ready, stopCamera }
}
