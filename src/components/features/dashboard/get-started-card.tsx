import Link from 'next/link'
import { ArrowRight02Icon, ShoppingCart02Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { SetUpPantryAction, StartShoppingDialog } from '@/components/features/base-lists'
import { UploadTicketDialog } from '@/components/features/tickets'
import { Button } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/utils'
import { GET_STARTED_RECEIPTS, type DashboardModel, type GetStartedStepId } from './helpers/build-dashboard-model'

interface Props {
	getStarted: NonNullable<DashboardModel['getStarted']>
	/** The list "Start Shopping" starts; null while no list has items. */
	startTarget: DashboardModel['startTarget']
	/** The account's single empty list, if that is all it has: the step then points straight at it. */
	addItemsTarget: DashboardModel['addItemsTarget']
	/** A trip is already running: the banner above carries "Continue", so the trip step offers no second way to start one. */
	tripInProgress?: boolean
}

const STEP_COPY: Record<GetStartedStepId, { title: string; description: string }> = {
	list: { title: 'Set up your Pantry', description: 'Keep the things you always have at home in one default list.' },
	trip: { title: 'Take a list shopping', description: 'Check items off as they go in the cart. Listys keeps the trip.' },
	receipts: { title: `Scan ${GET_STARTED_RECEIPTS} receipts`, description: 'Listys learns prices, stores and when you usually buy each thing.' },
}

const STATE_LABEL = { done: 'Done', current: 'Current step', next: 'Not started' } as const

/**
 * The path of an account that is still new: three steps in order, and only the current one opens with its action. The steps
 * come from the data (a list, a completed trip, three receipts), so nothing is stored and the card leaves by itself.
 */
export function GetStartedCard({ getStarted, startTarget, addItemsTarget, tripInProgress = false }: Props) {
	const total = getStarted.steps.length

	return (
		<section
			data-testid='dashboard-get-started'
			aria-labelledby='dashboard-get-started-title'
			className='min-w-0'
		>
			<Card size='spending'>
				<div className='flex flex-col gap-3'>
					<div className='flex items-center justify-between gap-3'>
						<CardTitle>
							<h2
								id='dashboard-get-started-title'
								className='font-display font-semibold md:text-xl'
							>
								Get Started
							</h2>
						</CardTitle>
						<span
							data-testid='dashboard-get-started-progress'
							className='shrink-0 font-mono text-xs text-muted-foreground'
						>
							{getStarted.completed} of {total}
						</span>
					</div>
					{/* One bar per step, decorative: the "N of 3" above says the same. */}
					<div
						aria-hidden='true'
						className='grid grid-cols-3 gap-1'
					>
						{getStarted.steps.map(step => (
							<Progress
								key={step.id}
								value={step.done ? 100 : 0}
								size='md'
								tone='track'
								tabIndex={-1}
							/>
						))}
					</div>
				</div>

				<ol className='mt-1 flex flex-col divide-y divide-border'>
					{getStarted.steps.map((step, index) => {
						const state = step.done ? 'done' : step.id === getStarted.current ? 'current' : 'next'
						const copy = STEP_COPY[step.id]
						return (
							<Item
								key={step.id}
								asChild
								size='sm'
								className='items-start'
							>
								<li
									data-testid={`dashboard-get-started-step-${step.id}`}
									data-state={state}
									aria-current={state === 'current' ? 'step' : undefined}
								>
									<ItemMedia>
										<StepMarker
											state={state}
											number={index + 1}
										/>
									</ItemMedia>
									<ItemContent>
										<ItemTitle className='w-full justify-between'>
											<span className={state === 'done' ? 'text-muted-foreground' : state === 'current' ? 'font-semibold' : undefined}>
												<span className='sr-only'>{STATE_LABEL[state]}: </span>
												{copy.title}
											</span>
											{step.id === 'receipts' && state !== 'done' ? (
												<span className='shrink-0 font-mono text-xs font-normal text-muted-foreground'>
													{getStarted.receiptsCount} of {GET_STARTED_RECEIPTS}
												</span>
											) : null}
										</ItemTitle>
										{state === 'current' ? (
											<>
												<ItemDescription>{copy.description}</ItemDescription>
												{step.id === 'trip' && tripInProgress ? null : (
													<div className='pt-2'>
														<StepAction
															step={step.id}
															startTarget={startTarget}
															addItemsTarget={addItemsTarget}
														/>
													</div>
												)}
											</>
										) : null}
									</ItemContent>
								</li>
							</Item>
						)
					})}
				</ol>
			</Card>
		</section>
	)
}

function StepMarker({ state, number }: { state: 'done' | 'current' | 'next'; number: number }) {
	if (state === 'done') {
		return (
			<span
				aria-hidden='true'
				className='flex size-6 items-center justify-center rounded-full bg-entity-trip text-entity-trip-on'
			>
				<HugeiconsIcon
					icon={Tick02Icon}
					strokeWidth={2}
					className='size-3.5'
				/>
			</span>
		)
	}
	return (
		<span
			aria-hidden='true'
			className={cn(
				'flex size-6 items-center justify-center rounded-full font-mono text-xs',
				state === 'current' ? 'bg-primary font-semibold text-primary-foreground' : 'text-muted-foreground ring-1 ring-border ring-inset',
			)}
		>
			{number}
		</span>
	)
}

function StepAction({ step, startTarget, addItemsTarget }: { step: GetStartedStepId } & Pick<Props, 'startTarget' | 'addItemsTarget'>) {
	if (step === 'list') return <SetUpPantryAction testId='dashboard-get-started-pantry' />
	if (step === 'receipts') {
		return (
			<UploadTicketDialog
				variant='default'
				size='lg'
				className='w-full md:w-auto'
			/>
		)
	}
	if (startTarget) {
		return (
			<StartShoppingDialog
				baseListId={startTarget.id}
				baseListName={startTarget.name}
				itemsCount={startTarget.itemsCount}
				variant='default'
				size='lg'
				className='w-full md:w-auto'
			>
				<HugeiconsIcon
					icon={ShoppingCart02Icon}
					strokeWidth={1.5}
					aria-hidden='true'
				/>
				Start Shopping
			</StartShoppingDialog>
		)
	}
	return (
		<Button
			asChild
			variant='default'
			size='lg'
			className='w-full md:w-auto'
		>
			<Link
				href={addItemsTarget ? `/base-lists/${addItemsTarget.id}/edit` : '/shopping-lists'}
				data-testid='dashboard-get-started-trip-cta'
				className='focus-ring'
			>
				{addItemsTarget ? 'Add Items' : 'Open Your Lists'}
				<HugeiconsIcon
					icon={ArrowRight02Icon}
					strokeWidth={2}
					className='size-4.5'
				/>
			</Link>
		</Button>
	)
}
