export const CATEGORIES = [
	'Produce',
	'Dairy',
	'Meat',
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
	'Other',
] as const

export type Category = typeof CATEGORIES[number]

export const CATEGORY_EMOJIS: Record<Category, string> = {
	Produce: '🥬',
	Dairy: '🥛',
	Meat: '🥩',
	Seafood: '🐟',
	Bakery: '🥖',
	Pantry: '🥫',
	Frozen: '🧊',
	Beverages: '🥤',
	Snacks: '🍿',
	Deli: '🧀',
	Food: '🍔',
	'Bulk Food': '🛒',
	'Health & Beauty': '🧴',
	Household: '🧽',
	Other: '📦',
}

export function getCategoryWithEmoji(category?: string | null) {
	if (!category) return ''

	const emoji = CATEGORY_EMOJIS[category as Category]
	return emoji ? `${emoji} ${category}` : category
}
