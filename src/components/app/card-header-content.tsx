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
		<div className='flex gap-2 items-center'>
			<span className='h-10 w-10 bg-primary/10 flex justify-center items-center rounded-lg shadow-sm'>
				<HugeiconsIcon
					icon={icon}
					strokeWidth={2}
					className='h-6 w-6 text-primary'
				/>
			</span>
			<div className='flex flex-col'>
				<CardTitle className='flex items-center justify-between truncate w-full max-w-[20ch]'>{title}</CardTitle>
				{description && <CardDescription className='text-xs'>{description}</CardDescription>}
			</div>
		</div>
	)
}
