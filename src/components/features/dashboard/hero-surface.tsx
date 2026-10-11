import type { ReactNode } from 'react'
import Image from 'next/image'

interface Props {
	testId: string
	/** Id of the heading that names the hero. */
	labelledBy: string
	children: ReactNode
}

/**
 * The dark photo surface both dashboard heroes share (24px radius, `card` shadow). Active sessions use art-directed
 * mobile and desktop crops, with a near-black scrim that keeps the text readable over each image.
 */
export function HeroSurface({ testId, labelledBy, children }: Props) {
	return (
		<section
			data-testid={testId}
			aria-labelledby={labelledBy}
			className='relative isolate flex min-h-0 items-center overflow-hidden rounded-3xl bg-slate-900 text-white shadow-[0_6px_20px_-8px_rgba(15,23,42,0.25)] md:min-h-[330px]'
		>
			<picture className='absolute inset-0 -z-20'>
				<source media='(min-width: 768px)' srcSet='/images/dashboard/desktop-session.webp' />
				<Image
					src='/images/dashboard/mobile-session.webp'
					alt=''
					fill
					loading='eager'
					sizes='(min-width: 1280px) 780px, 100vw'
					className='object-cover'
				/>
			</picture>
			<div
				aria-hidden='true'
				className='absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(8,13,26,.72)_0%,rgba(8,13,26,.58)_45%,rgba(8,13,26,.9)_100%)] md:bg-[linear-gradient(90deg,rgba(8,13,26,.78)_0%,rgba(8,13,26,.68)_46%,rgba(8,13,26,.12)_100%)]'
			/>
			{children}
		</section>
	)
}
