'use client'

import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons'
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

function SharedListCard({ title, subtitle, items, testId, trailingAvatars = false }: SharedListCardProps) {
	return (
		<Card
			data-testid={testId}
			className='premium-card relative w-full gap-0 rounded-[2rem] border border-white/70 bg-white/95 p-4 py-4 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.3)] ring-1 ring-amber-100/80 backdrop-blur'
		>
			<div className='flex items-center justify-between px-2 pb-3'>
				<div className='flex items-center gap-3'>
					<div
						aria-hidden='true'
						className='flex h-8 w-8 items-center justify-center rounded-full bg-slate-100'
					>
						<div className='space-y-0.5'>
							<span className='block h-0.5 w-3 rounded-full bg-slate-500' />
							<span className='block h-0.5 w-3 rounded-full bg-slate-500' />
							<span className='block h-0.5 w-3 rounded-full bg-slate-500' />
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
				<ul className='space-y-0.5'>
					{items.map(item => (
						<li
							key={`${title}-${item.name}-${item.detail}`}
							className='flex items-center gap-3 border-b border-slate-200/70 py-2.5 last:border-b-0'
						>
							<span
								aria-hidden='true'
								className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
									item.checked
										? 'border-emerald-500 bg-emerald-500 text-white'
										: 'border-slate-300 bg-white text-transparent'
								}`}
							>
								<HugeiconsIcon
									icon={CheckmarkCircle02Icon}
									className='h-3.5 w-3.5'
								/>
							</span>
							<span className='min-w-0 flex-1 text-sm font-medium capitalize tracking-tight text-slate-900'>
								{item.name}
							</span>
							<span className='shrink-0 rounded-md bg-lime-100 px-1.5 py-0.5 text-[10px] font-semibold text-lime-700'>
								{item.detail}
							</span>
						</li>
					))}
				</ul>
			</div>
		</Card>
	)
}

export function SharedListsShowcase() {
	const prefersReducedMotion = useReducedMotion()
	const spotlightPoints = [
		'Real-time updates while everyone shops',
		'Avoid duplicate purchases across the household',
		'Clear ownership with visible member activity',
	]

	return (
		<motion.section
			data-testid='shared-lists-showcase'
			aria-labelledby='shared-lists-showcase-title'
			className='section-soft-surface relative overflow-hidden py-16 sm:py-20'
			initial='hidden'
			whileInView='show'
			viewport={REVEAL_VIEWPORT}
			variants={STAGGER_REVEAL}
		>
			<div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_15%,rgba(59,130,246,0.08),transparent_34%),radial-gradient(circle_at_85%_12%,rgba(251,191,36,0.12),transparent_38%),radial-gradient(circle_at_70%_80%,rgba(14,165,233,0.06),transparent_34%)]' />
			<div className='pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/80 to-transparent' />
			<div className='pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/80 to-transparent' />

			<div className='relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8'>
				<div className='relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/70 p-4 shadow-[0_28px_80px_-42px_rgba(15,23,42,0.22)] ring-1 ring-slate-200/60 backdrop-blur sm:p-6 lg:p-8'>
					<div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_22%,rgba(59,130,246,0.07),transparent_32%),radial-gradient(circle_at_92%_26%,rgba(250,204,21,0.18),transparent_40%),radial-gradient(circle_at_78%_82%,rgba(125,211,252,0.12),transparent_38%)]' />
					<div className='relative grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8'>
						<motion.div
							className='relative z-10'
							variants={FADE_UP}
						>
							<div className='inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-amber-800'>
								<span className='h-1.5 w-1.5 rounded-full bg-amber-500' />
								Primary feature
							</div>
							<p className='mt-5 text-xs font-bold uppercase tracking-[0.2em] text-primary/80'>
								{SHARED_LISTS_SHOWCASE_COPY.eyebrow}
							</p>
							<h2
								id='shared-lists-showcase-title'
								data-testid='shared-lists-showcase-headline'
								className='mt-3 max-w-[14ch] text-balance font-serif text-3xl font-extrabold leading-[1.06] tracking-[-0.02em] text-slate-900 sm:text-4xl md:text-5xl lg:text-4xl xl:text-5xl'
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
												icon={CheckmarkCircle02Icon}
												className='h-3.5 w-3.5'
											/>
										</span>
										<span className='text-sm font-medium leading-relaxed text-slate-700'>{point}</span>
									</li>
								))}
							</ul>

							<div className='mt-6 flex items-center justify-between gap-4 rounded-2xl border border-slate-200/70 bg-white/85 px-4 py-3 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.2)] sm:max-w-md'>
								<div>
									<p className='text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500'>
										Live collaborators
									</p>
									<p className='mt-1 text-sm font-semibold text-slate-900'>Family + roommates in one list</p>
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
										title='Kitchen list'
										subtitle='Updated by Maya'
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
													animate={
														prefersReducedMotion ? undefined : { y: index === 0 ? [0, -2, 0] : [0, 2, 0] }
													}
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
												Shared updates sync instantly
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
										title='Shopping List'
										subtitle='Store run'
										items={SHARED_LISTS_BOTTOM_ITEMS}
										testId='shared-lists-showcase-card-bottom'
										trailingAvatars
									/>
								</motion.div>
							</div>
						</motion.div>
					</div>
				</div>
			</div>
		</motion.section>
	)
}
