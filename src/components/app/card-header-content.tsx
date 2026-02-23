import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import { Separator } from '../ui/separator'

interface Props {
	icon: IconSvgElement
	title: string
	description?: string
}

export default function CardHeaderContent({ icon, title, description }: Props) {
	return (
		<div className='flex gap-2 items-center p-4 pt-0'>
			<div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/5 border border-primary/10 transition-colors group-hover:bg-primary/10'>
				<HugeiconsIcon
					icon={icon}
					strokeWidth={2}
					className='h-4 w-4 text-primary'
				/>
			</div>
			<div className='min-w-0 flex-1 pr-14 sm:pr-0'>
				<CardTitle className=' text-base font-bold tracking-tight text-foreground transition-colors group-hover:text-primary max-w-[20ch]'>
					{title}
				</CardTitle>
				{description && (
					<CardDescription className='truncate text-xs font-medium text-muted-foreground'>
						{description}
					</CardDescription>
				)}
			</div>
		</div>
	)
}
