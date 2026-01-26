import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import { ArrowRight01Icon, ArrowRight02Icon } from '@hugeicons/core-free-icons'

interface Props {
	href: string
	icon: IconSvgElement
	title: string
	description: string
	count: number
}

export function DashboardCard({ href, icon, title, description, count }: Props) {
	return (
		<Card className='hover:border-primary/50 transition-colors cursor-pointer group'>
			<Link href={href}>
				<CardHeader>
					<div className='flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10'>
						<div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary'>
							<HugeiconsIcon
								icon={icon}
								strokeWidth={2}
								className='h-5 w-5 text-primary-foreground'
							/>
						</div>
					</div>

					<div>
						<CardTitle className='font-semibold tracking-tight text-xl'>{title}</CardTitle>
						<CardDescription>{description}</CardDescription>
					</div>
				</CardHeader>

				<CardContent>
					<div className='flex items-center justify-between mt-4'>
						<p className='text-3xl font-bold text-primary'>{count}</p>
						<div className='flex items-center text-sm text-muted-foreground group-hover:text-primary transition-colors'>
							<span>View more </span>
							<HugeiconsIcon
								icon={ArrowRight01Icon}
								strokeWidth={2}
								className='h-4 w-4'
							/>
						</div>
					</div>
				</CardContent>
			</Link>
		</Card>
	)
}
