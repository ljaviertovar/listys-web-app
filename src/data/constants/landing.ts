/**
 * Every string of the public landing page (`/`). Components only lay this copy out, so a Spanish switch replaces this
 * file and touches no layout. Product facts here must match PRODUCT.md: a finished trip always saves into its list,
 * sign-in is Google or email, there is one free account.
 */

export const LANDING_CTA = {
	label: 'Create free account',
	href: '/auth/signup',
}

export const LANDING_HERO = {
	title: 'Never write the same shopping list twice.',
	body: 'Photograph a receipt you already have. Listys reads the items so you can review them and choose what to add to a reusable list.',
	trust: ['Free, no paid tier', 'No credit card', 'You review every line before it saves'],
	receiptCaption: 'Market Fresh · 12 items · 5 categories',
	phoneSummary:
		'A phone showing the twelve items from that receipt as a shopping list in progress, three of twelve collected, shared with two other people.',
}

export const LANDING_HOW_IT_WORKS = {
	title: 'Photograph a receipt. Shop from the list. Repeat.',
	body: 'The receipt is how the list gets fed. The list is what you actually use.',
	steps: [
		{
			num: '01',
			title: 'Photograph the receipt',
			body: 'Up to five photos in one upload: the receipt in your pocket, the one that has been in a drawer for a month. Listys reads them in the background, and the store comes from the receipt header, so there is nothing to type.',
			fact: '1–5 photos per upload',
			image: {
				src: '/images/landing/step-01.webp',
				alt: 'A shopper photographing a grocery receipt with the Listys upload screen open on their phone.',
			},
		},
		{
			num: '02',
			title: 'Review every line, then keep it',
			body: 'Nothing is saved until you confirm. Every line opens for editing: fix a name, a quantity or a price, or drop it. Repeats merge by name, and a line printed differently can be linked to an item you already have.',
			fact: 'LECHE 2% 4L → 2% Milk 4L · linked',
			image: {
				src: '/images/landing/step-02.webp',
				alt: 'A shopper reviewing the items Listys read from a receipt, next to the paper receipt on a kitchen counter.',
			},
		},
		{
			num: '03',
			title: 'Shop it, and the list learns',
			body: 'A trip is a copy of the list, so the original stays intact whatever happens in the store. Finishing the trip saves what you checked into the list, and the next one opens with what your household buys most at the top.',
			fact: 'Every finished trip updates the list',
			image: {
				src: '/images/landing/step-03.webp',
				alt: 'A shopper checking items off a Listys shopping session while pushing a cart through the store.',
			},
		},
	],
}

export type MemoryRow = { chip: string; name: string; meta?: string }

export const LANDING_MEMORY = {
	title: 'A list that remembers what you buy.',
	body: 'There is nothing to set up. Each receipt and each finished trip adds to the list, so the next shop starts closer to done.',
	before: {
		label: 'Trip 1',
		title: 'Pantry',
		meta: 'first receipt · as printed',
		rows: [
			{ chip: '1 box', name: 'Organic strawberries' },
			{ chip: '1 L', name: 'Almond milk' },
			{ chip: '1 unit', name: 'Sourdough bread' },
			{ chip: '3 unit', name: 'Avocados' },
			{ chip: '500 g', name: 'Greek yogurt' },
			{ chip: '12 unit', name: 'Free-range eggs' },
		] satisfies MemoryRow[],
	},
	after: {
		label: 'Trip 5',
		title: 'Pantry',
		meta: 'most bought first',
		rows: [
			{ chip: '1 L', name: 'Almond milk', meta: 'bought 5× · last Jun 21 · $4.50 avg' },
			{ chip: '12 unit', name: 'Free-range eggs', meta: 'bought 5× · last Jun 21 · $4.80 avg' },
			{ chip: '1 box', name: 'Organic strawberries', meta: 'bought 4× · last Jun 21 · $5.99 avg' },
			{ chip: '1 unit', name: 'Sourdough bread', meta: 'bought 4× · last Jun 14 · $5.25 avg' },
			{ chip: '500 g', name: 'Greek yogurt', meta: 'bought 3× · last Jun 07 · $6.50 avg' },
			{ chip: '3 unit', name: 'Avocados', meta: 'bought 2× · last May 24 · $4.99 avg' },
		] satisfies MemoryRow[],
		estimate: 'est. $32.03',
		estimateNote: 'covers 6 of 6 items',
	},
	illustrative: 'Illustrative data',
	facts: [
		'Every list on one screen',
		'Every trip kept in history',
		'Prices compared by store once two receipts agree',
	],
}

export const LANDING_SHARED = {
	title: 'Two of you, one list, at the same time.',
	bannerShort: 'Noah is in the aisle. Maya is at home, and sees each check the moment he taps it.',
	bannerLong:
		'Noah is in the aisle. Maya is at home. The moment he checks something off, it is checked for her, and for anyone else on the list.',
	bannerAlt: 'Two shoppers, one at a kitchen counter and one in a grocery aisle, both looking at their phones.',
	body: 'Share a list with the people you shop for. Each item shows who added it and who picked it up, so nobody comes home with two of anything.',
	members: 'Maya, Noah and Ava share this list',
	device: {
		label: 'Noah · in the aisle',
		listTitle: 'Weekly household',
		progress: '4 of 9 items checked',
		status: 'Shopping',
	},
	presence: {
		who: 'Maya · at home',
		what: 'Sees almond milk checked',
		when: 'now',
		status: 'Synced',
	},
}

export const LANDING_FAQ = {
	title: 'Before you create an account',
	body: 'The things worth knowing before you hand over an email address.',
	items: [
		{
			question: 'Do I have to retype my list every week?',
			answer:
				'No. The items from a receipt go into a reusable base list once you have reviewed them. Every trip starts from that list, and finishing a trip saves what you checked back into it.',
		},
		{
			question: 'What happens when the scan gets something wrong?',
			answer:
				'You fix it before it counts. Every extracted line opens for editing: change the name, the quantity or the price, or remove the line. Nothing is saved until you confirm.',
		},
		{
			question: 'Which receipts work?',
			answer:
				'Printed receipts from any store. Upload one to five photos at a time; a flat, well-lit photo reads best. The store name is read from the receipt itself.',
		},
		{
			question: 'What happens to my receipt photos?',
			answer:
				'They are kept in private storage tied to your account and opened only through short-lived links. Deleting a receipt deletes its photos.',
		},
		{
			question: 'What is a shopping session?',
			answer:
				'A copy of a list, made for one trip. Check items off as you walk the aisles while the original list stays as it was. When you finish, the items you checked are saved into the list, so the next trip starts better ordered.',
		},
		{
			question: 'Can my household share a list?',
			answer:
				'Yes. Share a base list with its invite link. Everyone on it sees the same list and the trip started from it, with each check as it happens. If the signal drops in the store, your checks stay on the phone and sync when it reconnects.',
		},
		{
			question: 'What does it cost?',
			answer: 'Nothing. One free account, with everything on this page in it. No paid tier and no card at sign-up.',
		},
	],
}

export const LANDING_GET_STARTED = {
	title: 'Start with the receipt in your pocket.',
	body: 'Create a free account, photograph a receipt, review the lines, and keep them as a list you will use again.',
	signIn: 'Google or email sign-in · no credit card',
	slip: {
		shop: 'LISTYS',
		meta: 'YOUR FIRST LIST',
		lines: [
			['ACCOUNT', '0.00'],
			['RECEIPTS · 1–5 PER UPLOAD', '0.00'],
			['REVIEW EVERY LINE', '0.00'],
			['SHARED LISTS', '0.00'],
		] as [string, string][],
		total: '0.00',
		footer: 'NO PAID TIER',
	},
}

export const LANDING_FOOTER = {
	tagline: 'Turn a receipt into a list your household will actually reuse.',
	social: [
		{ label: 'GitHub', href: 'https://github.com/ljaviertovar' },
		{ label: 'X (Twitter)', href: 'https://x.com/ljaviertovar' },
	],
}
