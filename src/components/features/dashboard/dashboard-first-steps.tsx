import { CheckmarkCircle02Icon, ShoppingCart02Icon, Upload06Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'

import { CreateGroupDialog } from '@/components/features/shopping-lists'
import { CARD_ACTION } from './helpers/dashboard-styles'

const STEPS: { icon: IconSvgElement; title: string; detail: string }[] = [
	{ icon: Upload06Icon, title: 'Upload a receipt', detail: 'One to five photos of a shop you already did.' },
	{ icon: CheckmarkCircle02Icon, title: 'Review the items', detail: 'You check every item before it is saved.' },
	{ icon: ShoppingCart02Icon, title: 'Shop from the list', detail: 'Check items off as you fill the cart.' },
]

/**
 * What a brand-new account sees under the hero instead of three empty section cards: the three steps that get it going,
 * and the manual route (create a group) for someone who would rather type a list.
 */
export function DashboardFirstSteps() {
	return (
		<section
			data-testid='dashboard-first-steps'
			aria-labelledby='dashboard-first-steps-title'
			className='flex flex-col gap-4 rounded-[20px] border border-slate-200/70 bg-card p-4.5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-18px_rgba(15,23,42,0.28)] md:rounded-3xl md:p-5 dark:border-border dark:shadow-none'
		>
			<h2
				id='dashboard-first-steps-title'
				className='font-display text-base font-[650] leading-[1.3]'
			>
				How it works
			</h2>
			<ol className='grid gap-4 md:grid-cols-3'>
				{STEPS.map((step, index) => (
					<li
						key={step.title}
						className='flex items-start gap-3'
					>
						<span className='flex size-10 shrink-0 items-center justify-center rounded-[14px] bg-blue-50 text-primary dark:bg-primary/10'>
							<HugeiconsIcon
								icon={step.icon}
								strokeWidth={1.5}
								className='size-5'
							/>
						</span>
						<span className='flex min-w-0 flex-col gap-1'>
							<span className='text-sm leading-[1.3] font-semibold'>
								<span className='font-mono text-muted-foreground'>{index + 1}.</span> {step.title}
							</span>
							<span className='text-[13px] leading-[1.55] text-muted-foreground'>{step.detail}</span>
						</span>
					</li>
				))}
			</ol>
			<div className='flex flex-col items-start gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-border'>
				<span className='text-[13px] leading-[1.55] text-muted-foreground'>Prefer to type your list yourself?</span>
				<CreateGroupDialog
					variant='outline'
					className={CARD_ACTION}
				/>
			</div>
		</section>
	)
}
