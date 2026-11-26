import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'

import { MonoLabel, SectionWrapper, Shell } from '../commons'
import { SharedTripMock } from '../mockups'

/** 04 — Shared lists: a full-bleed photo with the headline, then two phones of the same household showing the same trip. */
export function SharedListsShowcaseSection() {
	return (
		<SectionWrapper
			id='shared-lists'
			testId='landing-shared-lists'
			rhythm='none'
			contained={false}
			className='pb-11 md:pb-[72px] lg:pb-22'
		>
			<div className='relative aspect-4/5 overflow-hidden md:aspect-auto md:h-[clamp(380px,48vw,620px)]'>
				<Image
					src='/images/landing/shared-lists-mobile.webp'
					alt='Two shoppers checking their phones while sharing a grocery list.'
					fill
					sizes='100vw'
					className='object-cover object-center md:hidden'
				/>
				<Image
					src='/images/landing/shared-lists-desktop.webp'
					alt='Two shoppers checking their phones while sharing a grocery list.'
					fill
					sizes='100vw'
					className='hidden object-cover object-top md:block'
				/>
				<div className='absolute inset-0 bg-linear-to-b from-night/10 via-transparent via-35% to-night/88 max-md:from-transparent max-md:via-40%' />
				<Shell
					testId='landing-shared-lists-caption'
					className='absolute inset-x-0 bottom-0 z-10 pb-[58px] md:pb-[132px]'
				>
					<MonoLabel tone='on-photo'>04 — Shared lists</MonoLabel>
					<h2 className='mt-2.5 max-w-[13ch] text-4xl leading-[0.96] font-extrabold tracking-[-0.045em] text-white md:mt-3 md:text-[clamp(36px,5vw,68px)]'>
						Two of you, one list, at the same time.
					</h2>
				</Shell>
			</div>
			<Shell testId='landing-shared-lists-shell'>
				<div className='relative z-10 -mt-[30px] grid gap-0 md:-mt-24 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)] md:items-start md:gap-[22px] [&>*]:min-w-0'>
					<Device
						who='Noah · in the aisle'
						overPhoto
						testId='landing-shared-noah'
					/>
					<p className='my-3 ml-[18px] flex min-h-11 items-center gap-2.5 border-l-2 border-dashed border-paper-line pl-4 text-sm text-paper-text md:hidden'>
						<HugeiconsIcon
							icon={CheckmarkCircle02Icon}
							strokeWidth={1.8}
							aria-hidden='true'
							className='size-[18px] shrink-0 text-feedback-success'
						/>
						Almond milk checked by Noah shows on Maya’s phone
					</p>
					<Device
						who='Maya · at home'
						testId='landing-shared-maya'
						className='ml-7 md:mt-10 md:ml-0'
					/>
					<div
						data-reveal
						className='pt-[22px] md:pt-[132px]'
					>
						<p className='text-base leading-relaxed text-paper-text md:text-[17px]'>
							Share a list with the people you shop for. Everyone on it sees the same trip, and a check on one phone
							shows up on the others.
						</p>
						<div className='mt-3.5 rounded-[14px] border-[1.5px] border-dashed border-paper-line px-3.5 py-3 text-[15px] leading-normal md:mt-[18px] md:px-4 md:py-3.5'>
							<MonoLabel
								as='p'
								tone='ink'
								className='mb-1'
							>
								Signal drops in the store?
							</MonoLabel>
							Your checks wait on the phone and save when it reconnects.
						</div>
					</div>
				</div>
			</Shell>
		</SectionWrapper>
	)
}

type DeviceProps = {
	who: string
	/** The first phone starts over the photo on a phone and on desktop, so its caption is white. */
	overPhoto?: boolean
	testId: string
	/** External layout only (offsets). */
	className?: string
}

/** One person's phone: who and where, then their view of the shared trip. */
function Device({ who, overPhoto = false, testId, className }: DeviceProps) {
	return (
		<div
			data-reveal
			className={className}
		>
			<p className='mb-2 ml-1 flex items-center gap-2 md:mb-2.5 md:ml-0'>
				<span className='size-[7px] rounded-full bg-feedback-success md:ring-2 md:ring-white/80' />
				<MonoLabel tone={overPhoto ? 'on-photo' : 'on-photo-from-md'}>{who}</MonoLabel>
			</p>
			<div
				aria-hidden='true'
				inert
			>
				<SharedTripMock testId={testId} />
			</div>
		</div>
	)
}
