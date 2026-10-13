import { MAX_TICKET_IMAGE_MB } from '@/lib/config/limits'

export type PhotoVerdict = 'ok' | 'format' | 'size'

type PhotoLike = Pick<File, 'name' | 'type' | 'size'>

const MAX_BYTES = MAX_TICKET_IMAGE_MB * 1024 * 1024

/** iPhones save HEIC by default and the OCR cannot read it, so the person is told to export to JPG or PNG. */
export function isHeic(file: PhotoLike): boolean {
	const type = (file.type || '').toLowerCase()
	return type.includes('heic') || type.includes('heif') || /\.(heic|heif)$/i.test(file.name)
}

export function classifyPhoto(file: PhotoLike): PhotoVerdict {
	if (isHeic(file)) return 'format'
	if (file.size > MAX_BYTES) return 'size'
	return 'ok'
}

/** What is wrong with a photo that was left out, in words that say how to fix it. */
export function rejectionMessage(name: string, verdict: Exclude<PhotoVerdict, 'ok'>): { title: string; hint: string } {
	return verdict === 'format'
		? {
				title: `${name} can’t be used`,
				hint: 'HEIC photos aren’t supported yet. Export it as JPG or PNG and add it again.',
			}
		: {
				title: `${name} is too large`,
				hint: `Each photo can be up to ${MAX_TICKET_IMAGE_MB} MB. Choose a smaller one or lower its quality.`,
			}
}
