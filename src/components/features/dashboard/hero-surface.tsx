import type { ReactNode } from 'react'
import Image from 'next/image'

interface Props {
	testId: string
	/** Id of the heading that names the hero. */
	labelledBy: string
	children: ReactNode
}

/**
 * The dark photo surface both dashboard heroes share (24px radius, `card` shadow). The photo goes through `next/image`
 * so it is resized and cached like the rest of the app's images, with an ink (#0F172A) scrim on top that keeps the text
 * at AA contrast: vertical on phones, where the text spans the whole width, and fading out to the right from `md`.
 */
export function HeroSurface({ testId, labelledBy, children }: Props) {
	return (
		<section
			data-testid={testId}
			aria-labelledby={labelledBy}
			className='relative isolate flex min-h-0 items-center overflow-hidden rounded-3xl bg-slate-900 text-white shadow-card md:min-h-[330px]'
		>
			<Image
				src='/images/landing/close-bg.jpg'
				alt=''
				fill
				priority
				sizes='(min-width: 1280px) 780px, 100vw'
				className='-z-20 object-cover'
			/>
			<div
				aria-hidden='true'
				className='absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(15,23,42,.93)_0%,rgba(15,23,42,.86)_100%)] md:bg-[linear-gradient(90deg,rgba(15,23,42,.95)_0%,rgba(15,23,42,.88)_46%,rgba(15,23,42,.45)_100%)]'
			/>
			{children}
		</section>
	)
}
