import { describe, expect, it } from 'vitest'

import { buildUploadFormData } from '../helpers/build-upload-form-data'

const photo = (name: string) => new File(['photo'], name, { type: 'image/jpeg' })

describe('buildUploadFormData', () => {
	it('sends the trip only when the upload starts on one', () => {
		const fromTrip = buildUploadFormData([photo('a.jpg')], 'trip-1')
		const standalone = buildUploadFormData([photo('a.jpg')])

		expect(fromTrip.get('shopping_session_id')).toBe('trip-1')
		expect(standalone.has('shopping_session_id')).toBe(false)
	})

	it('keeps every photo in order', () => {
		const form = buildUploadFormData([photo('top.jpg'), photo('bottom.jpg')], 'trip-1')

		expect((form.getAll('files') as File[]).map(file => file.name)).toEqual(['top.jpg', 'bottom.jpg'])
	})
})
