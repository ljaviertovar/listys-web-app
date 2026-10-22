import { ButtonLink, Icon } from '../commons'

export function GetStartedSection() {
	return (
		<div
			data-testid='landing-get-started'
			className='w-full'
		>
			<h2 className='max-w-[14em] text-[clamp(32px,4vw,48px)] leading-[1.1] font-[750] tracking-[-0.035em] text-white text-balance'>
				Start with the receipt in your pocket.
			</h2>
			<p className='mt-[18px] max-w-[32em] text-lg leading-[1.65] font-[450] text-slate-300'>
				Create a free account, upload a receipt, review the extracted items, and add your picks to a reusable list.
			</p>
			<div className='mt-8 flex flex-col items-start gap-[14px]'>
				<ButtonLink
					size='xl'
					href='/auth/signup'
				>
					Create Free Account <Icon id='arr' />
				</ButtonLink>
				<span className='font-mono text-xs font-medium tracking-[0.01em] text-[#A8B4C6]'>
					Google or email sign-in · no credit card required
				</span>
			</div>
		</div>
	)
}
