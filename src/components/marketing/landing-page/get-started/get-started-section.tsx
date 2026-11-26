import { ArrowRight02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'

import { ButtonLink, MonoLabel, SectionWrapper } from '../commons'

/** The close: what Listys costs, printed as a receipt total, and the one call to action. */
export function GetStartedSection() {
	return (
		<SectionWrapper
			id='get-started'
			testId='landing-get-started'
			surface='white'
			rhythm='none'
		>
			<div className='grid items-center gap-[30px] pt-11 pb-10 md:gap-10 md:py-20 min-[62.5rem]:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] min-[62.5rem]:gap-16 min-[62.5rem]:py-28 [&>*]:min-w-0'>
				<div data-reveal>
					<MonoLabel as='p'>What Listys costs</MonoLabel>
					<p className='mt-1 font-mono text-[104px] leading-[0.9] font-medium tracking-[-0.06em] text-paper-ink tabular-nums md:mt-1.5 md:text-[clamp(84px,14vw,190px)]'>
						<span className='sr-only'>$0.00</span>
						<span aria-hidden='true'>
							$0
							<span className='text-primary'>
								<i className='-mx-[0.16em] not-italic'>.</i>00
							</span>
						</span>
					</p>
					<MonoLabel
						as='p'
						className='mt-3 md:mt-3.5'
					>
						Not a trial · No card · No paid tier
					</MonoLabel>
					<h2 className='mt-[22px] max-w-[14ch] text-[32px] leading-[1.02] font-extrabold tracking-[-0.04em] text-paper-ink md:mt-7 md:text-[clamp(30px,3.6vw,46px)]'>
						Start with the receipt in your pocket.
					</h2>
					<p className='mt-3 max-w-[30em] text-base md:mt-4 md:text-lg'>
						One receipt is enough to start a list. Every receipt after it makes the list, and its prices, sharper.
					</p>
					<ButtonLink
						href='/auth/signup'
						size='2xl'
						testId='landing-get-started-cta'
						className='mt-[22px] w-full md:mt-[30px] md:w-auto'
					>
						Create free account
						<HugeiconsIcon
							icon={ArrowRight02Icon}
							strokeWidth={2}
							data-icon='inline-end'
						/>
					</ButtonLink>
					<MonoLabel
						as='p'
						className='mt-3 text-center md:mt-3.5 md:text-left'
					>
						Google or email sign-in
					</MonoLabel>
				</div>
				<div
					data-reveal
					className='relative aspect-4/3 overflow-hidden rounded-2xl shadow-2xl md:aspect-16/10 min-[62.5rem]:aspect-4/5 min-[62.5rem]:rounded-[18px]'
				>
					<Image
						src='/images/landing/cta-create-acc.webp'
						alt='A shopper tucking a grocery receipt into a pocket.'
						fill
						sizes='(min-width: 1000px) 480px, 100vw'
						className='object-cover object-[72%_center]'
					/>
				</div>
			</div>
		</SectionWrapper>
	)
}
