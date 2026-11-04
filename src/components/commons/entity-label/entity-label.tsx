import { Store01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

interface EntityLabelProps {
	/** The linked store's name. */
	name: string
	/** A store the user chose by hand adds "· set by you" in grey regular. */
	manual?: boolean
	testId?: string
}

/**
 * Entity (canvas 3/7): another thing in the app the object is linked to, today only a store. It has no box, so it never reads as a status
 * or a tag: a 14px violet store icon and the name in Inter 600 / 12.
 */
export function EntityLabel({ name, manual = false, testId = 'entity-label' }: EntityLabelProps) {
	return (
		<span
			data-testid={testId}
			className='inline-flex min-w-0 items-center gap-1.5 text-xs leading-none'
		>
			<HugeiconsIcon
				icon={Store01Icon}
				strokeWidth={1.8}
				aria-hidden='true'
				className='size-3.5 shrink-0 text-violet-600 dark:text-violet-300'
			/>
			<span className='truncate font-semibold text-violet-800 dark:text-violet-200'>{name}</span>
			{manual ? <span className='shrink-0 font-normal text-slate-500 dark:text-muted-foreground'>· set by you</span> : null}
		</span>
	)
}
