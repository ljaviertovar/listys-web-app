export const CATEGORIES = [
	'Produce',
	'Dairy',
	'Meat',
	'Meats',
	'Seafood',
	'Bakery',
	'Pantry',
	'Frozen',
	'Beverages',
	'Snacks',
	'Health & Beauty',
	'Household',
	'Deli',
	'Food',
	'Bulk Food',
	'Health Wellness',
	'Home',
	'Other',
	'Grocery',
	'Bakery Commercial',
	'Health',
	'Alcohol',
	'Frozen Foods',
] as const

export type Category = typeof CATEGORIES[number]

export const CATEGORY_EMOJIS: Record<Category, string> = {
	Produce: '🥬',
	Dairy: '🥛',
	Meat: '🥩',
	Meats: '🥩',
	Seafood: '🐟',
	Bakery: '🥖',
	Pantry: '🥫',
	Frozen: '🧊',
	Beverages: '🥤',
	Snacks: '🍿',
	Deli: '🧀',
	Food: '🍔',
	'Health Wellness': '🧴',
	'Health': '🧴',
	'Bulk Food': '🛒',
	'Health & Beauty': '🧴',
	Household: '🧽',
	Home: '🏠',
	Other: '📦',
	Grocery: '🛍️',
	'Bakery Commercial': '🥖',
	Alcohol: '🍺',
	'Frozen Foods': '🧊',
}

/**
 * Normalize a raw category string: strip leading department numbers
 * and convert to Title Case (e.g. "27 PRODUCE" -> "Produce").
 */
export function normalizeCategory(raw: string): string {
	// Remove non-letter/number chars, collapse whitespace
	let cleaned = raw.replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
	// Strip leading department/aisle numbers
	cleaned = cleaned.replace(/^\d+\s+/, '')
	if (!cleaned) return raw
	return cleaned
		.split(/\s+/)
		.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
		.join(' ')
}

export function getCategoryWithEmoji(category?: string | null) {
	if (!category) return ''

	const normalized = normalizeCategory(category)
	const emoji = CATEGORY_EMOJIS[normalized as Category]
	return emoji ? `${emoji} ${normalized}` : normalized
}
