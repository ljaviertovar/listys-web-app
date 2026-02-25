import {
	AnalyticsUpIcon,
	ArtificialIntelligence02Icon,
	Camera01Icon,
	CheckmarkBadge01Icon,
	Share02Icon,
	ShoppingCart02Icon,
	ViewIcon,
} from '@hugeicons/core-free-icons'

export const TRUST_STATS = [
	{ stat: '99%', label: 'OCR accuracy', icon: ViewIcon },
	{ stat: '10+', label: 'Shared groups', icon: Share02Icon },
	{ stat: '250', label: 'Items per list', icon: ShoppingCart02Icon },
	{ stat: '4.9/5', label: 'App store rating', icon: CheckmarkBadge01Icon },
]

export const PROCESS_STEPS = [
	{
		title: 'Scan receipt in seconds',
		desc: 'Snap a receipt and extract items, quantities, and prices in seconds.',
		icon: Camera01Icon,
		badge: 'Capture',
	},
	{
		title: 'Review and organize instantly',
		desc: 'Review the result and start with a clean list ready for your next trip.',
		icon: ArtificialIntelligence02Icon,
		badge: 'Organize',
	},
	{
		title: 'Shop with a focused list',
		desc: 'Check off items as you shop and keep spending visible in real time.',
		icon: AnalyticsUpIcon,
		badge: 'Execute',
	},
]

export const PREVIEW_BY_STEP = [
	[
		{ name: 'Organic Strawberries', detail: 'Produce - $5.99', checked: true },
		{ name: 'Almond Milk', detail: 'Dairy - $4.50', checked: true },
		{ name: 'Sourdough Bread', detail: 'Bakery - $5.25', checked: false },
	],
	[
		{ name: 'Avocados (3)', detail: 'Produce - $4.99', checked: true },
		{ name: 'Greek Yogurt', detail: 'Dairy - $6.50', checked: false },
		{ name: 'Sparkling Water', detail: 'Beverages - $4.80', checked: false },
	],
	[
		{ name: 'Chicken Breast', detail: 'Protein - $12.30', checked: true },
		{ name: 'Cherry Tomatoes', detail: 'Produce - $3.75', checked: true },
		{ name: 'Parmesan', detail: 'Dairy - $6.20', checked: false },
	],
]

export const FEATURE_CARDS = [
	{
		title: 'AI receipt extraction',
		desc: 'Turn messy receipts into editable items, quantities, and prices.',
		icon: ArtificialIntelligence02Icon,
	},
	{
		title: 'Household coordination',
		desc: 'Keep one shared list synced across family members and roommates.',
		icon: Share02Icon,
	},
	{
		title: 'Real-time progress',
		desc: 'Check items off live so everyone sees what is left.',
		icon: ShoppingCart02Icon,
	},
	{
		title: 'Spending visibility',
		desc: 'Track totals while you shop and spot spending patterns over time.',
		icon: AnalyticsUpIcon,
	},
]

export type SharedListPreviewItem = {
	name: string
	detail: string
	checked: boolean
}

export type SharedAvatar = {
	name: string
	initials: string
	accentClassName: string
}

export const SHARED_LISTS_SHOWCASE_COPY = {
	eyebrow: 'Shared lists',
	title: 'Shop better together with shared lists',
	description: 'Use one live household list so everyone can add items, sync updates, and avoid duplicate buys.',
}

export const SHARED_LISTS_TOP_ITEMS: SharedListPreviewItem[] = [
	{ name: 'apples', detail: '1 kg', checked: false },
	{ name: 'tuna', detail: '3 pieces', checked: false },
	{ name: 'milk', detail: 'Lactose free', checked: false },
	{ name: 'toothpaste', detail: '1 piece', checked: false },
	{ name: 'shampoo', detail: 'Anti-dandruff', checked: false },
]

export const SHARED_LISTS_BOTTOM_ITEMS: SharedListPreviewItem[] = [
	{ name: 'apples', detail: '2 kg', checked: true },
	{ name: 'tuna', detail: '3 pieces', checked: true },
	{ name: 'milk', detail: 'Lactose free', checked: false },
	{ name: 'toothpaste', detail: '1 piece', checked: true },
	{ name: 'shampoo', detail: 'Anti-dandruff', checked: false },
]

export const SHARED_LISTS_AVATARS: SharedAvatar[] = [
	{
		name: 'Maya',
		initials: 'MY',
		accentClassName: 'bg-gradient-to-br from-emerald-300 via-lime-200 to-emerald-100 text-emerald-900',
	},
	{
		name: 'Noah',
		initials: 'NH',
		accentClassName: 'bg-gradient-to-br from-amber-300 via-yellow-200 to-orange-100 text-amber-950',
	},
	{
		name: 'Ava',
		initials: 'AV',
		accentClassName: 'bg-gradient-to-br from-sky-300 via-cyan-200 to-blue-100 text-sky-950',
	},
]

export const PHONE_PREVIEW_ITEMS = [
	{ name: 'Organic Strawberries', detail: 'Produce - $5.99', checked: true },
	{ name: 'Almond Milk', detail: 'Dairy - $4.50', checked: true },
	{ name: 'Sourdough Bread', detail: 'Bakery - $5.25', checked: false },
	{ name: 'Avocados (3)', detail: 'Produce - $4.99', checked: false },
	{ name: 'Greek Yogurt', detail: 'Dairy - $6.50', checked: false },
]

export const STAT_ACCENTS = [
	{
		icon: 'bg-primary/10 text-primary ring-primary/15',
		stat: 'text-primary',
		label: 'text-primary/80',
	},
	{
		icon: 'bg-chart-2/10 text-chart-2 ring-chart-2/20',
		stat: 'text-chart-2',
		label: 'text-chart-2/80',
	},
	{
		icon: 'bg-chart-3/10 text-chart-3 ring-chart-3/20',
		stat: 'text-chart-3',
		label: 'text-chart-3/80',
	},
	{
		icon: 'bg-chart-4/10 text-chart-4 ring-chart-4/20',
		stat: 'text-chart-4',
		label: 'text-chart-4/80',
	},
]

export const FEATURE_ACCENTS = [
	{
		icon: 'bg-primary/10 text-primary ring-primary/15 group-hover:bg-primary group-hover:text-white',
	},
	{
		icon: 'bg-chart-2/10 text-chart-2 ring-chart-2/15 group-hover:bg-chart-2 group-hover:text-white',
	},
	{
		icon: 'bg-chart-3/10 text-chart-3 ring-chart-3/15 group-hover:bg-chart-3 group-hover:text-white',
	},
	{
		icon: 'bg-chart-4/10 text-chart-4 ring-chart-4/15 group-hover:bg-chart-4 group-hover:text-white',
	},
]

export const REVEAL_VIEWPORT = { once: true, amount: 0.18 }

export const STAGGER_REVEAL = {
	hidden: {},
	show: {
		transition: { staggerChildren: 0.08 },
	},
} as const

export const FADE_UP = {
	hidden: { opacity: 0, y: 18 },
	show: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.48, ease: 'easeOut' as const },
	},
} as const

export const HERO_MEDIA_REVEAL = {
	hidden: { opacity: 0, y: 36 },
	show: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.62, delay: 0.42, ease: 'easeOut' as const },
	},
} as const
