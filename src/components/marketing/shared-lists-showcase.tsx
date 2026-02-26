'use client'

import { Checkmark } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, useReducedMotion } from 'framer-motion'

import {
	FADE_UP,
	REVEAL_VIEWPORT,
	SHARED_LISTS_AVATARS,
	SHARED_LISTS_BOTTOM_ITEMS,
	SHARED_LISTS_SHOWCASE_COPY,
	SHARED_LISTS_TOP_ITEMS,
	STAGGER_REVEAL,
	type SharedListPreviewItem,
} from '@/data/constants'
import { Avatar, AvatarFallback, AvatarGroup } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'

type SharedListCardProps = {
	title: string
	subtitle?: string
	items: SharedListPreviewItem[]
	testId: string
	trailingAvatars?: boolean
}

type SharedListCategory = {
	icon: string
	title: string
	meta: string
	items: SharedListPreviewItem[]
}

function parseDetail(detail: string) {
	const parts = detail.trim().split(/\s+/)
	const first = parts[0]

	if (first && /^[0-9]+$/.test(first)) {
		return {
			quantity: first,
			unit: parts.slice(1).join(' ') || 'unit',
			notes: '',
		}
	}

	return {
		quantity: '1',
		unit: 'unit',
		notes: detail,
	}
}

const SHARED_LIST_CATEGORY_META: Record<string, { icon: string; title: string }> = {
	bakery: { icon: '🥖', title: 'BAKERY' },
	dairy: { icon: '🥛', title: 'DAIRY' },
	produce: { icon: '🍎', title: 'PRODUCE' },
}

function getItemCategory(itemName: string) {
	const name = itemName.toLowerCase()

	if (name.includes('bread')) return 'bakery'
	if (name.includes('milk') || name.includes('yogurt')) return 'dairy'
	return 'produce'
}

function buildCategoryMeta(items: SharedListPreviewItem[]) {
	const checked = items.filter(item => item.checked).length
	return `${items.length} Item${items.length === 1 ? '' : 's'}   ${checked}/${items.length} Checked`
}

function groupSharedListItems(items: SharedListPreviewItem[]): SharedListCategory[] {
	const order = ['bakery', 'dairy', 'produce'] as const
	const buckets = new Map<string, SharedListPreviewItem[]>()

	for (const item of items) {
		const category = getItemCategory(item.name)
		const current = buckets.get(category) ?? []
		current.push(item)
		buckets.set(category, current)
	}

	return order
		.filter(category => buckets.has(category))
		.map(category => {
			const categoryItems = buckets.get(category) ?? []
			const meta = SHARED_LIST_CATEGORY_META[category]

			return {
				icon: meta.icon,
				title: meta.title,
				meta: buildCategoryMeta(categoryItems),
				items: categoryItems,
			}
		})
}

function SharedListCard({ title, subtitle, items, testId, trailingAvatars = false }: SharedListCardProps) {
	const groupedItems = groupSharedListItems(items)

	return (
		<Card
			data-testid={testId}
			className='premium-card relative w-full gap-0 rounded-[2rem] border border-white/70 bg-white/95 p-4 py-4 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.3)] ring-1 ring-amber-100/80 backdrop-blur'
		>
			<div className='flex items-center justify-between px-2 pb-3'>
				<div className='flex items-center gap-3'>
					<div
						aria-hidden='true'
						className='flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100'
					>
						<div className='space-y-0.5'>
							<span className='block h-0.5 w-3 rounded-full bg-primary' />
							<span className='block h-0.5 w-3 rounded-full bg-primary' />
							<span className='block h-0.5 w-3 rounded-full bg-primary' />
						</div>
					</div>
					<div>
						<p className='text-sm font-bold tracking-tight text-slate-900'>{title}</p>
						{subtitle ? <p className='text-[11px] text-slate-500'>{subtitle}</p> : null}
					</div>
				</div>

				{trailingAvatars ? (
					<AvatarGroup className='mr-1'>
						{SHARED_LISTS_AVATARS.slice(0, 2).map(member => (
							<Avatar
								key={`${title}-${member.initials}`}
								size='sm'
								className='ring-2 ring-white'
								aria-label={`${member.name} avatar`}
							>
								<AvatarFallback className={`${member.accentClassName} text-[9px] font-bold`}>
									{member.initials}
								</AvatarFallback>
							</Avatar>
						))}
					</AvatarGroup>
				) : (
					<span className='rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700'>
						Live shared
					</span>
				)}
			</div>

			<div className='rounded-[1.4rem] border border-slate-100 bg-slate-50/90 px-3 py-2'>
				<div className='space-y-3'>
					{groupedItems.map(category => (
						<div key={`${title}-${category.title}`}>
							<div className='mb-2 px-1'>
								<p className='flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-tight text-slate-800'>
									<span aria-hidden='true'>{category.icon}</span>
									<span>{category.title}</span>
								</p>
								<p className='mt-0.5 text-left text-[9px] font-semibold uppercase tracking-tight text-slate-400'>
									{category.meta}
								</p>
							</div>

							<ul className='space-y-2'>
								{category.items.map(item => {
									const parsed = parseDetail(item.detail)

									return (
										<li
											key={`${title}-${category.title}-${item.name}-${item.detail}`}
											className={`rounded-xl border px-3 py-2 shadow-[0_10px_20px_-24px_rgba(15,23,42,0.25)] ${
												item.checked ? 'border-primary bg-primary/5' : 'border-slate-100 bg-white'
											}`}
										>
											<div className='flex items-center gap-2.5'>
												<div className='inline-flex h-7 min-w-[46px] items-center justify-center rounded-md bg-primary/10 px-2 text-[10px] font-bold text-primary'>
													{parsed.quantity}
													<span className='ml-1 text-[9px] font-semibold lowercase opacity-70'>{parsed.unit}</span>
												</div>
												<div className='min-w-0 flex-1 text-left'>
													<p className='truncate text-[11px] font-bold tracking-tight text-slate-800'>{item.name}</p>
													{parsed.notes ? <p className='truncate text-[10px] text-slate-500'>{parsed.notes}</p> : null}
												</div>
												<div
													aria-hidden='true'
													className={`flex h-5 w-5 items-center justify-center rounded-md border ${
														item.checked
															? 'border-primary bg-primary text-white'
															: 'border-primary/70 bg-white text-transparent'
													}`}
												>
													<HugeiconsIcon
														icon={Checkmark}
														className='h-3 w-3'
														strokeWidth={3}
													/>
												</div>
											</div>
										</li>
									)
								})}
							</ul>
						</div>
					))}
				</div>
			</div>
		</Card>
	)
}

export function SharedListsShowcase() {
	const prefersReducedMotion = useReducedMotion()
	const spotlightPoints = [
		'See updates instantly, even while someone is already at the store',
		'Prevent duplicate buys with one shared source of truth',
		'Know who added or completed each item at a glance',
	]

	return (
		<motion.section
			id='shared-lists'
			data-testid='shared-lists-showcase'
			aria-labelledby='shared-lists-showcase-title'
			className=' relative overflow-hidden py-16 sm:py-20'
			initial='hidden'
			whileInView='show'
			viewport={REVEAL_VIEWPORT}
			variants={STAGGER_REVEAL}
		>
			<div className='relative mx-auto grid w-full max-w-7xl gap-12 px-4 sm:px-6 md:grid-cols-2 md:items-start lg:items-center lg:px-8'>
				<motion.div
					className='relative z-10'
					variants={FADE_UP}
				>
					<p className='mt-5 text-xs font-bold uppercase tracking-[0.2em] text-primary/80'>
						{SHARED_LISTS_SHOWCASE_COPY.eyebrow}
					</p>
					<h2
						id='shared-lists-showcase-title'
						data-testid='shared-lists-showcase-headline'
						className='mt-3  text-balance font-serif text-3xl font-extrabold leading-[1.06] tracking-[-0.02em] text-slate-900 sm:text-4xl md:text-5xl lg:text-4xl xl:text-5xl'
					>
						{SHARED_LISTS_SHOWCASE_COPY.title}
					</h2>
					<p className='mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base'>
						{SHARED_LISTS_SHOWCASE_COPY.description}
					</p>

					<ul className='mt-7 space-y-3'>
						{spotlightPoints.map(point => (
							<li
								key={point}
								className='flex items-start gap-3 rounded-xl border border-slate-200/70 bg-white/80 px-3.5 py-3 shadow-[0_8px_25px_-22px_rgba(15,23,42,0.28)]'
							>
								<span className='mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white'>
									<HugeiconsIcon
										icon={Checkmark}
										className='h-3.5 w-3.5'
										strokeWidth={3}
									/>
								</span>
								<span className='text-sm font-medium leading-relaxed text-slate-700'>{point}</span>
							</li>
						))}
					</ul>

					<div className='mt-6 flex items-center justify-between gap-4 rounded-2xl border border-slate-200/70 bg-white/85 px-4 py-3 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.2)] sm:max-w-md'>
						<div>
							<p className='text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500'>Live collaborators</p>
							<p className='mt-1 text-sm font-semibold text-slate-900'>Everyone shops from the same live list</p>
						</div>
						<AvatarGroup>
							{SHARED_LISTS_AVATARS.map(member => (
								<Avatar
									key={`summary-${member.initials}`}
									size='sm'
									aria-label={`${member.name} avatar`}
								>
									<AvatarFallback className={`${member.accentClassName} text-[9px] font-bold`}>
										{member.initials}
									</AvatarFallback>
								</Avatar>
							))}
						</AvatarGroup>
					</div>
				</motion.div>

				<motion.div
					className='relative z-10'
					variants={FADE_UP}
				>
					<div className='relative mx-auto flex w-full max-w-[30rem] flex-col items-center rounded-[2rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,252,232,0.95)_0%,rgba(254,243,199,0.9)_46%,rgba(255,250,229,0.95)_100%)] p-4 shadow-[0_24px_70px_-34px_rgba(15,23,42,0.28)] ring-1 ring-amber-100/80 sm:p-5'>
						<div className='pointer-events-none absolute inset-x-6 top-6 bottom-6 rounded-[2rem] bg-white/25 blur-2xl' />

						<motion.div
							className='relative z-10 w-full'
							variants={FADE_UP}
						>
							<SharedListCard
								title='Weekly groceries'
								subtitle='Maya is adding items'
								items={SHARED_LISTS_TOP_ITEMS}
								testId='shared-lists-showcase-card-top'
							/>
						</motion.div>

						<div
							aria-hidden='true'
							className='relative z-0 flex w-full flex-col items-center py-4 sm:py-5'
						>
							<div className='absolute top-0 h-full w-px bg-[repeating-linear-gradient(to_bottom,rgba(245,158,11,0.5)_0_7px,transparent_7px_14px)]' />
							<div className='relative z-10 flex w-full flex-col items-center gap-3'>
								<div
									data-testid='shared-lists-showcase-avatars'
									className='flex items-center justify-center gap-3'
								>
									{SHARED_LISTS_AVATARS.slice(0, 2).map((member, index) => (
										<motion.div
											key={`bridge-${member.initials}`}
											variants={FADE_UP}
											animate={prefersReducedMotion ? undefined : { y: index === 0 ? [0, -2, 0] : [0, 2, 0] }}
											transition={
												prefersReducedMotion
													? undefined
													: { duration: 3.2, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }
											}
											className='will-change-transform'
										>
											<Avatar
												size='lg'
												className='h-14 w-14 ring-4 ring-white/90 shadow-[0_12px_28px_-14px_rgba(0,0,0,0.35)]'
												aria-label={`${member.name} avatar`}
											>
												<AvatarFallback className={`${member.accentClassName} text-sm font-bold`}>
													{member.initials}
												</AvatarFallback>
											</Avatar>
										</motion.div>
									))}
								</div>

								<div className='rounded-2xl bg-white/85 px-5 py-3.5 text-center shadow-[0_16px_30px_-22px_rgba(15,23,42,0.35)] ring-1 ring-white/75 backdrop-blur'>
									<p className='text-xs font-semibold uppercase tracking-[0.15em] text-amber-700'>
										Shared updates sync in real time
									</p>
								</div>
							</div>
						</div>

						<div
							aria-hidden='true'
							className='relative z-0 flex w-full flex-col items-center pb-4'
						>
							<div className='absolute top-0 h-full w-px bg-[repeating-linear-gradient(to_bottom,rgba(245,158,11,0.5)_0_7px,transparent_7px_14px)]' />
							<div className='relative z-10 flex h-6 items-center justify-center'>
								<span className='h-2.5 w-2.5 rotate-45 border-b-2 border-r-2 border-amber-400' />
							</div>
						</div>

						<motion.div
							className='relative z-10 w-full'
							variants={FADE_UP}
						>
							<SharedListCard
								title='Weekly groceries'
								subtitle='Noah is shopping live'
								items={SHARED_LISTS_BOTTOM_ITEMS}
								testId='shared-lists-showcase-card-bottom'
								trailingAvatars
							/>
						</motion.div>
					</div>
				</motion.div>
			</div>
		</motion.section>
	)
}
