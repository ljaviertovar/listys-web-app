import { ArrowDown01Icon, ArrowLeft01Icon, ArrowUp01Icon, ShoppingBag03Icon, Tick02Icon, Upload06Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { ActiveShoppingBadge } from '@/components/app/active-session'
import { CategoryHeading, RowIcon } from '@/components/commons'
import { SessionSummaryCard } from '@/components/features/shopping-sessions'
import { LogoMark } from '@/components/commons/logo'
import { Card } from '@/components/ui/card'
import { MOBILE_TAB_ITEMS } from '@/data/constants'
import { cn } from '@/utils'

import { ItemsPanel, TripRowMock, type TripRowMockData } from './trip-row-mock'

const PRODUCE: TripRowMockData[] = [
	{ quantity: 1, unit: 'box', name: 'Organic strawberries', store: 'Market Fresh', price: 5.99 },
	{
		quantity: 3,
		unit: 'unit',
		name: 'Avocados',
		note: 'Get the ones that are ready, not rock hard',
		store: 'Market Fresh',
		alsoAt: 'also at No Frills',
		price: 4.99,
	},
]

const DAIRY: TripRowMockData[] = [
	{ quantity: 500, unit: 'g', name: 'Greek yogurt', price: 6.5 },
	{ quantity: 1, unit: 'L', name: 'Almond milk', price: 4.5 },
]

/**
 * The hero's phone: the app's running-trip screen for the list "Pantry" (PageHeader, SessionSummaryCard, ShoppingSessionItems, the
 * floating trip action and the bottom tab bar), drawn with the app's own parts and fixed data.
 */
export function HeroPhone() {
	const [dashboard, lists, receipts, trips] = MOBILE_TAB_ITEMS

	return (
		<div
			data-testid='landing-hero-phone'
			className='relative h-[656px] w-[320px] max-w-[calc(100vw-32px)] rounded-[40px] bg-night-raised p-1.5 shadow-2xl ring-1 ring-black/20 before:absolute before:top-[15px] before:left-1/2 before:z-30 before:h-[25px] before:w-[86px] before:-translate-x-1/2 before:rounded-full before:bg-night'
		>
			<div className='flex h-full flex-col overflow-hidden rounded-[34px] bg-muted font-sans text-foreground'>
				<div className='flex items-center justify-between px-[22px] pt-[13px] pb-1.5 text-xs font-bold'>
					<span>9:41</span>
					<span className='flex items-end gap-0.5'>
						{[4, 6.5, 9, 12].map(height => (
							<span
								key={height}
								className='w-[3px] rounded-[1px] bg-current'
								style={{ height }}
							/>
						))}
					</span>
				</div>
				<div className='flex items-center justify-between px-3 pt-2 pb-2 border-b border-border'>
					<span className='flex items-center gap-2 font-brand text-lg font-semibold tracking-tight [&_svg]:size-6.5'>
						<LogoMark />
						Listys
					</span>
					<span className='flex size-[30px] items-center justify-center rounded-full bg-linear-135 from-paper-text to-paper-muted text-[11px] font-bold text-white'>
						JT
					</span>
				</div>

				<div className='relative flex flex-1 flex-col gap-2.5 overflow-hidden px-3 pt-3.5 after:absolute after:inset-x-0 after:bottom-0 after:z-10 after:h-10 after:bg-linear-to-b after:from-transparent after:to-muted after:to-80%'>
					<div className='flex flex-col gap-1.5'>
						<span className='flex items-center gap-1.5 text-[13px] font-medium text-secondary-foreground'>
							<HugeiconsIcon
								icon={ArrowLeft01Icon}
								strokeWidth={1.8}
								className='size-3.5'
							/>
							Back to Lists
						</span>
						<div className='mt-0.5 flex items-start gap-2.5'>
							<RowIcon
								icon={ShoppingBag03Icon}
								tone='success'
								size='stat'
								testId='landing-hero-phone-trip-icon'
							/>
							<b className='min-w-0 flex-1 font-display text-[22px] leading-7 font-bold tracking-tight'>Pantry</b>
							<ActiveShoppingBadge className='mt-1' />
						</div>
						<div className='flex items-center justify-between text-[13px] text-muted-foreground'>
							<span>
								<b className='font-mono text-sm font-medium text-foreground'>12</b> items
							</span>
							<span className='inline-flex items-center gap-1 text-[11.5px] font-semibold'>
								<HugeiconsIcon
									icon={Tick02Icon}
									strokeWidth={2}
									className='size-3'
								/>
								Saved
							</span>
						</div>
					</div>

					<div className='shrink-0'>
						<SessionSummaryCard
							mode='active'
							checked={3}
							total={12}
							estimate={{ total: 16.25, pricedCount: 3, itemCount: 3 }}
							testId='landing-hero-phone-progress'
						/>
					</div>

					<Card
						size='list'
						className='shrink-0'
					>
						<span className='-mb-1 flex h-8 items-center justify-center gap-1.5 text-[13px] font-semibold text-secondary-foreground'>
							<HugeiconsIcon
								icon={ArrowUp01Icon}
								strokeWidth={1.8}
								className='size-3.5'
							/>
							Collapse All
						</span>
						<CategoryRun
							category='Produce'
							count='0/5'
							rows={PRODUCE}
						/>
						<div className='border-t border-muted pt-1'>
							<CategoryRun
								category='Dairy'
								count='2/2'
								complete
								rows={DAIRY}
								checked
							/>
						</div>
					</Card>

					<span className='absolute right-3 bottom-3 z-20 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg'>
						<HugeiconsIcon
							icon={ShoppingBag03Icon}
							strokeWidth={1.5}
							className='size-5'
						/>
					</span>
				</div>

				<div className='relative z-30 grid grid-cols-5 items-start bg-card px-1.5 pt-1.5 pb-3.5 border-t border-border'>
					<PhoneTab item={dashboard} />
					<PhoneTab
						item={lists}
						current
					/>
					<span className='flex flex-col items-center'>
						<span className='-mt-[17px] flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md'>
							<HugeiconsIcon
								icon={Upload06Icon}
								strokeWidth={1.5}
								className='size-[18px]'
							/>
						</span>
						<span className='mt-[7px] text-[10px] leading-snug font-medium text-muted-foreground'>Upload</span>
					</span>
					<PhoneTab item={receipts} />
					<PhoneTab
						item={trips}
						dot
					/>
				</div>
			</div>
		</div>
	)
}

type CategoryRunProps = {
	category: string
	count: string
	complete?: boolean
	checked?: boolean
	rows: TripRowMockData[]
}

/** One category of the trip: its heading (CategoryHeading inside the collapsible trigger) and its rows. */
function CategoryRun({ category, count, complete = false, checked = false, rows }: CategoryRunProps) {
	return (
		<div className='flex flex-col gap-1'>
			<div className='flex items-center gap-2.5 px-1 py-2'>
				<CategoryHeading
					category={category}
					count={count}
					complete={complete}
					testId={`landing-hero-phone-${category.toLowerCase()}`}
				/>
				<HugeiconsIcon
					icon={ArrowDown01Icon}
					strokeWidth={1.8}
					className='size-4 shrink-0 text-muted-foreground'
				/>
			</div>
			<ItemsPanel testId={`landing-hero-phone-${category.toLowerCase()}-rows`}>
				{rows.map(row => (
					<TripRowMock
						key={row.name}
						{...row}
						checkbox={checked ? 'checked' : 'unchecked'}
						testId={`landing-hero-phone-row-${row.name.toLowerCase().replaceAll(' ', '-')}`}
					/>
				))}
			</ItemsPanel>
		</div>
	)
}

type PhoneTabProps = {
	item: (typeof MOBILE_TAB_ITEMS)[number]
	current?: boolean
	/** The green dot of a running trip on the Trips tab. */
	dot?: boolean
}

/** One tab of the app's bottom bar (MobileTabBar), the current one in the Lists tone. */
function PhoneTab({ item, current = false, dot = false }: PhoneTabProps) {
	return (
		<span
			className={cn(
				'flex min-h-12 flex-col items-center gap-1 rounded-xl pt-1.5 text-[10px] leading-none',
				current ? 'bg-entity-list font-semibold text-entity-list-on' : 'font-medium text-muted-foreground',
			)}
		>
			<span className='relative block size-5'>
				<HugeiconsIcon
					icon={item.icon}
					strokeWidth={1.5}
					className='size-5'
				/>
				{dot ? (
					<span className='absolute -top-0.5 -right-1 size-2 rounded-full border-[1.5px] border-card bg-feedback-success' />
				) : null}
			</span>
			{item.title}
		</span>
	)
}
