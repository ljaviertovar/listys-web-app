/**
 * The name proposed when the user saves a receipt's raw store text as a new store: "NO FRILLS #3127" becomes
 * "No Frills". Branch numbers go (the same ones the database ignores when it compares names) and a name in a single case
 * (capitals as printed, or all lowercase as OCR reads some logos, "metro") becomes Title Case; a name that mixes cases is
 * kept as written. Only a proposal: the user can edit it before saving.
 */
export function suggestStoreName(raw: string | null | undefined): string {
	if (!raw) return ''

	const withoutBranch = raw
		.replace(/#\s*\d+/g, ' ')
		.replace(/\s\d{3,}\s*$/, '')
		.replace(/\s+/g, ' ')
		.trim()

	const hasLetters = withoutBranch.toUpperCase() !== withoutBranch.toLowerCase()
	const singleCase = withoutBranch === withoutBranch.toUpperCase() || withoutBranch === withoutBranch.toLowerCase()
	const titled = hasLetters && singleCase
		? withoutBranch
				.split(' ')
				.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
				.join(' ')
		: withoutBranch

	return titled.slice(0, 100).trim()
}
