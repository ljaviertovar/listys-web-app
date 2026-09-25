import { Shell } from './shell'

const FAQS = [
	{
		question: 'Do I have to retype my list every week?',
		answer:
			'No. Photograph a receipt once and its items become a base list you keep. Next week you start from that list instead of a blank one, and every new receipt fills in a little more of it.',
	},
	{
		question: 'What happens when the scan gets something wrong?',
		answer:
			'You catch it. Extracted items land in a review screen before anything is saved — change a name, fix a quantity, delete a line that should not be there. We aim for 99% accuracy on a legible receipt; the review step covers the rest.',
	},
	{
		question: 'What is a shopping session?',
		answer:
			"A copy of a list, made for one trip. Check items off as you walk the aisles — your original list stays untouched no matter what you do in the store. When you finish, you decide whether the trip's changes go back into it.",
	},
	{
		question: 'Can my household share a list?',
		answer:
			'Yes. Invite them to a group and you all see the same list at the same time. When someone ticks off milk in the aisle, it is ticked for everyone, so nobody comes home with a second carton.',
	},
	{
		question: 'What does it cost?',
		answer: 'Nothing. One free account, with everything on this page in it. No paid tier and no card at sign-up.',
	},
]

export function Faq() {
	return (
		<section
			id='faq'
			data-testid='landing-faq'
			className='section-divider scroll-mt-16 bg-slate-50 py-[72px] min-[900px]:py-[104px]'
		>
			<Shell>
				<div className='mt-2 grid grid-cols-1 gap-7 min-[920px]:grid-cols-[minmax(0,1.32fr)_minmax(0,1fr)] min-[920px]:items-start min-[920px]:gap-16'>
					<div className='min-[920px]:sticky min-[920px]:top-[96px] min-[920px]:order-2'>
						<h2 className='text-[clamp(28px,3.6vw,40px)] leading-[1.08] font-extrabold text-slate-900 text-balance'>
							Before you create an account
						</h2>
						<p className='mt-[14px] max-w-[30em] text-base leading-[1.6] text-slate-600'>
							Five things worth knowing before you hand over an email address.
						</p>
					</div>
					<div className='overflow-hidden rounded-2xl border border-slate-200 bg-white min-[920px]:order-1'>
						{FAQS.map((faq, index) => (
							<details
								key={faq.question}
								open={index === 0}
								className='group border-t border-slate-200 open:bg-[linear-gradient(180deg,rgba(37,99,235,.035),transparent_60%)] first-of-type:border-t-0'
							>
								<summary className='flex cursor-pointer list-none items-center justify-between gap-[22px] px-[22px] py-5 text-[15.5px] font-bold tracking-[-0.015em] text-slate-900 transition-colors hover:text-blue-700 [&::-webkit-details-marker]:hidden min-[920px]:px-[26px] min-[920px]:py-[22px] min-[920px]:text-[16.5px]'>
									{faq.question}
									<span
										className='relative size-4 shrink-0 text-slate-500 group-open:text-primary'
										aria-hidden='true'
									>
										<span className='absolute top-[7.25px] right-0 left-0 h-[1.5px] rounded-[1px] bg-current' />
										<span className='absolute top-0 bottom-0 left-[7.25px] w-[1.5px] rounded-[1px] bg-current transition-[transform,opacity] duration-[180ms] group-open:scale-y-0 group-open:opacity-0' />
									</span>
								</summary>
								<p className='max-w-[48em] px-[22px] pb-[22px] text-[14.5px] leading-[1.7] text-slate-600 min-[920px]:px-[26px] min-[920px]:pb-[26px] min-[920px]:text-[15px]'>
									{faq.answer}
								</p>
							</details>
						))}
					</div>
				</div>
			</Shell>
		</section>
	)
}
