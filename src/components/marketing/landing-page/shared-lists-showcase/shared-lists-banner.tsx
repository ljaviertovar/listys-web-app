import Image from 'next/image'

/** The photo carries the section headline; the mockups below prove the claim it makes. */
export function SharedListsBanner() {
	return (
		<div
			data-testid='shared-lists-banner'
			className='relative h-[210px] overflow-hidden rounded-2xl min-[900px]:h-[300px] min-[900px]:rounded-[20px]'
		>
			<Image
				src='/images/landing/shared-lists.webp'
				alt='Two shoppers, one at a kitchen counter and one in a grocery aisle, both looking at their phones.'
				fill
				sizes='(min-width: 1200px) 1136px, calc(100vw - 40px)'
				className='object-cover object-[center_28%]'
			/>
			<div
				aria-hidden='true'
				className='absolute inset-0 bg-[linear-gradient(0deg,rgba(15,23,42,.82)_0%,rgba(15,23,42,.2)_60%,transparent_80%)] min-[900px]:bg-[linear-gradient(0deg,rgba(15,23,42,.78)_0%,rgba(15,23,42,.15)_55%,transparent_75%)]'
			/>
			<div className='absolute inset-x-[18px] bottom-4 min-[900px]:inset-x-8 min-[900px]:bottom-[26px]'>
				<span className='font-mono text-[10px] tracking-[.12em] text-violet-300 uppercase min-[900px]:text-[11px]'>
					Shared lists
				</span>
				<h2 className='mt-[5px] text-[22px] leading-[1.12] font-extrabold tracking-[-0.03em] text-white text-balance min-[900px]:mt-1.5 min-[900px]:text-[clamp(28px,3vw,32px)] min-[900px]:leading-[1.1]'>
					Two of you, one list, in real time.
				</h2>
				<p className='mt-1.5 max-w-[46em] text-[12.5px] leading-[1.5] text-slate-200 min-[900px]:mt-2 min-[900px]:text-[14.5px] min-[900px]:leading-[1.55]'>
					{/* Shorter copy on narrow screens so the text never covers the faces in the photo. */}
					<span className='min-[640px]:hidden'>
						Noah is in the aisle. Maya is at home — the check lands for her the moment he taps it.
					</span>
					<span className='hidden min-[640px]:inline'>
						Noah is in the aisle. Maya is at home. The moment he ticks something off, it is ticked for her — and for
						anyone else on the list.
					</span>
				</p>
			</div>
		</div>
	)
}
