import { ButtonLink, Icon } from '../commons'

export function GetStartedSection() {
	return (
		<div
			data-testid='landing-get-started'
			className='w-full'
		>
			<h2 className='max-w-[14em] text-[clamp(31px,4.2vw,46px)] leading-[1.08] font-extrabold text-white text-balance'>
				Start with the receipt in your pocket.
			</h2>
			<p className='mt-[18px] max-w-[32em] text-[clamp(15px,1.7vw,18px)] leading-[1.55] text-slate-300'>
				Create a free account, upload one receipt, and walk out with a list your household can use this week.
			</p>
			<div className='mt-8 flex flex-col items-start gap-[14px]'>
				<ButtonLink
					size='xl'
					href='/auth/signup'
				>
					Create free account <Icon id='arr' />
				</ButtonLink>
				<span className='font-mono text-xs tracking-[.05em] text-[#A8B4C6]'>
					Google sign-in · no card · your lists stay yours
				</span>
			</div>
		</div>
	)
}
