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

/** Line icon of a category, so the list uses the same icon family as the rest of the app instead of emoji. */
export function getTicketCategoryIcon(category: string): IconSvgElement {
	return CATEGORY_ICONS[category] ?? Package01Icon
}
