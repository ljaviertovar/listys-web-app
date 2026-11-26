import { cn } from '@/utils'

export type GhostVariant = 'receipt' | 'list' | 'items' | 'trip'

type GhostRow = { width: string; box?: 'open' | 'checked'; total?: boolean }

const RECEIPT_LINES = ['w-full', 'w-[70%]', 'w-full', 'w-1/2', 'w-full', 'w-4/5']

// What each screen is waiting for: a reusable list (open boxes), a new list's first items, or a finished trip with its total.
const ROWS: Record<Exclude<GhostVariant, 'receipt'>, GhostRow[]> = {
	list: [
		{ box: 'open', width: 'w-[70%]' },
		{ box: 'open', width: 'w-full' },
		{ box: 'open', width: 'w-[55%]' },
		{ box: 'open', width: 'w-4/5' },
	],
	items: [
		{ box: 'open', width: 'w-[62%]' },
		{ box: 'open', width: 'w-[44%]' },
		{ box: 'open', width: 'w-[70%]' },
	],
	trip: [
		{ box: 'checked', width: 'w-[65%]' },
		{ box: 'checked', width: 'w-full' },
		{ box: 'checked', width: 'w-1/2' },
		{ width: 'w-2/5', total: true },
	],
}

const BAR = 'block h-[3px] rounded-xs bg-paper-sunken dark:bg-border'
const FRAME = 'relative mx-auto flex flex-col overflow-hidden rounded-t-lg border-[1.5px] border-dashed border-paper-line dark:border-border'

interface Props {
	/** `receipt` carries the scan line: the screen is waiting for a photo. The others sketch the rows that will appear. */
	variant?: GhostVariant
	testId?: string
}

/** The thing that is not there yet, sketched in dashes on an empty ticket. Decorative. */
export function GhostReceipt({ variant = 'receipt', testId = 'ghost-receipt' }: Props) {
	if (variant === 'receipt') {
		return (
			<div
				data-testid={testId}
				data-variant={variant}
				aria-hidden='true'
				className={cn(FRAME, 'w-33 gap-1.5 px-2.5 pt-3 pb-3.5')}
			>
				{RECEIPT_LINES.map((width, index) => (
					<i
						key={index}
						className={cn(BAR, width)}
					/>
				))}
				<span className='absolute inset-x-0 top-[30%] h-0.5 animate-scan-sweep bg-linear-to-r from-transparent via-sky-400 to-transparent shadow-sm shadow-sky-400/40 motion-reduce:animate-none' />
			</div>
		)
	}

	return (
		<div
			data-testid={testId}
			data-variant={variant}
			aria-hidden='true'
			className={cn(FRAME, 'w-44 gap-2.5 px-3 pt-3.5 pb-4')}
		>
			{ROWS[variant].map((row, index) => (
				<span
					key={index}
					className='flex h-[11px] items-center gap-2'
				>
					{row.box ? (
						<b
							className={cn(
								'size-[11px] shrink-0 rounded-[3px]',
								row.box === 'checked'
									? 'bg-paper-sunken dark:bg-border'
									: 'border-[1.5px] border-dashed border-paper-muted/40 dark:border-muted-foreground/40',
							)}
						/>
					) : null}
					<span className='flex flex-1'>
						<i className={cn(BAR, row.width)} />
					</span>
					{row.total ? <u className={cn(BAR, 'w-[22px] shrink-0')} /> : null}
				</span>
			))}
		</div>
	)
}
