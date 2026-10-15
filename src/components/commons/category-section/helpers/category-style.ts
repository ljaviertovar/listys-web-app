import {
	Apple01Icon,
	Bread01Icon,
	CarrotIcon,
	CheeseIcon,
	CleanIcon,
	FishFoodIcon,
	Home01Icon,
	JarIcon,
	Leaf01Icon,
	Package01Icon,
	PopcornIcon,
	ShoppingBag01Icon,
	SnowIcon,
	SodaCanIcon,
	SteakIcon,
	TShirtIcon,
} from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react'

const CATEGORY_ICONS: Record<string, IconSvgElement> = {
	Produce: Apple01Icon,
	'Salad Greens': CarrotIcon,
	'Salad Bar': CarrotIcon,
	Dairy: CheeseIcon,
	Deli: CheeseIcon,
	Meat: SteakIcon,
	Meats: SteakIcon,
	Seafood: FishFoodIcon,
	Bakery: Bread01Icon,
	'Bakery Commercial': Bread01Icon,
	Pantry: JarIcon,
	Frozen: SnowIcon,
	'Frozen Food': SnowIcon,
	Beverages: SodaCanIcon,
	Alcohol: SodaCanIcon,
	Snacks: PopcornIcon,
	Household: CleanIcon,
	Home: Home01Icon,
	Apparel: TShirtIcon,
	'Natural Foods': Leaf01Icon,
	'Bulk Food': ShoppingBag01Icon,
	Grocery: ShoppingBag01Icon,
}

/** The 700 level of each hue on the grey tile of its category (design A1), with the lighter level the dark theme needs. */
const TONE = {
	amber: 'text-amber-700 dark:text-amber-400',
	orange: 'text-orange-700 dark:text-orange-400',
	sky: 'text-sky-700 dark:text-sky-400',
	teal: 'text-teal-700 dark:text-teal-400',
	red: 'text-red-700 dark:text-red-400',
	purple: 'text-purple-700 dark:text-purple-400',
	green: 'text-green-700 dark:text-green-400',
	indigo: 'text-indigo-700 dark:text-indigo-400',
	blue: 'text-blue-700 dark:text-blue-400',
	yellow: 'text-yellow-700 dark:text-yellow-400',
	pink: 'text-pink-700 dark:text-pink-400',
	lime: 'text-lime-700 dark:text-lime-400',
	slate: 'text-slate-600 dark:text-muted-foreground',
} as const

const CATEGORY_TONES: Record<string, string> = {
	Bakery: TONE.amber,
	'Bakery Commercial': TONE.amber,
	'Bulk Food': TONE.orange,
	Grocery: TONE.orange,
	Dairy: TONE.sky,
	Deli: TONE.yellow,
	Frozen: TONE.teal,
	'Frozen Food': TONE.teal,
	Meat: TONE.red,
	Meats: TONE.red,
	Pantry: TONE.purple,
	Produce: TONE.green,
	'Salad Greens': TONE.green,
	'Salad Bar': TONE.green,
	Home: TONE.indigo,
	Household: TONE.indigo,
	Seafood: TONE.blue,
	Beverages: TONE.sky,
	Alcohol: TONE.purple,
	Snacks: TONE.yellow,
	Apparel: TONE.pink,
	'Natural Foods': TONE.lime,
}

/** Line icon of a category, so the list uses the same icon family as the rest of the app instead of emoji. */
export function getCategoryIcon(category: string): IconSvgElement {
	return CATEGORY_ICONS[category] ?? Package01Icon
}

/** Text colour of a category's icon; the tile behind it stays grey for every category, so colour tells them apart, not the surface. */
export function getCategoryTone(category: string): string {
	return CATEGORY_TONES[category] ?? TONE.slate
}
