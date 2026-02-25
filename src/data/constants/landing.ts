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
	{ stat: '10+', label: 'List groups', icon: Share02Icon },
	{ stat: '250', label: 'Items per list', icon: ShoppingCart02Icon },
	{ stat: '4.9/5', label: 'App store rating', icon: CheckmarkBadge01Icon },
]

export const PROCESS_STEPS = [
	{
		title: 'Scan receipt in seconds',
		desc: 'Take a photo and Listys extracts every product, price, and quantity automatically.',
		icon: Camera01Icon,
		badge: 'Capture',
	},
	{
		title: 'Review and organize instantly',
		desc: 'Listys classifies items by category so your next shopping trip is already structured.',
		icon: ArtificialIntelligence02Icon,
		badge: 'Organize',
	},
	{
		title: 'Shop with a focused list',
		desc: 'Track completed items live and keep your spending visible while you shop.',
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
		desc: 'Advanced OCR turns unstructured receipts into clean, editable shopping data.',
		icon: ArtificialIntelligence02Icon,
	},
	{
		title: 'Shared household lists',
		desc: 'Coordinate with family members in one shared space, without duplicated purchases.',
		icon: Share02Icon,
	},
	{
		title: 'Real-time progress',
		desc: 'Mark products as completed and always know what is left in your current run.',
		icon: ShoppingCart02Icon,
	},
	{
		title: 'Spending visibility',
		desc: 'Understand how much you spend by category and make better decisions every week.',
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
	description: 'Keep one live list for the whole household and avoid duplicate purchases while everyone contributes.',
}

export const SHARED_LISTS_TOP_ITEMS: SharedListPreviewItem[] = [
	{ name: 'apples', detail: '1 kg', checked: true },
	{ name: 'tuna', detail: '3 pieces', checked: false },
	{ name: 'milk', detail: 'Lactose free', checked: false },
	{ name: 'toothpaste', detail: '1 piece', checked: true },
	{ name: 'shampoo', detail: 'Anti-dandruff', checked: false },
]

export const SHARED_LISTS_BOTTOM_ITEMS: SharedListPreviewItem[] = [
	{ name: 'potatoes', detail: '2 kg', checked: false },
	{ name: 'pasta', detail: '1 pack', checked: false },
	{ name: 'watermelon', detail: 'x1', checked: false },
	{ name: 'apples', detail: '2 kg', checked: true },
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
