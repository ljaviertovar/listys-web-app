const FAQS = [
	{
		question: 'Do I have to retype my list every week?',
		answer:
			'No. Review the items from a receipt and choose what to add to a reusable base list. Start your next shopping session from that list.',
	},
	{
		question: 'What happens when the scan gets something wrong?',
		answer:
			'You can compare the extracted items with your receipt, then choose what to add to a base list.',
	},
	{
		question: 'What is a shopping session?',
		answer:
			"A copy of a list, made for one trip. Check items off as you walk the aisles — your original list stays untouched no matter what you do in the store. When you finish, you decide whether the trip's changes go back into it.",
	},
	{
		question: 'Can my household share a list?',
		answer:
			'Yes. Share a base list using its invite link. The link gives access to that list and the shopping session started from it.',
	},
	{
		question: 'What does it cost?',
		answer: 'Nothing. One free account, with everything on this page in it. No paid tier and no card at sign-up.',
	},
]

export function FaqSection() {
	return (
		<div
			data-testid='landing-faq'
			className='w-full'
		>
			<div className='mt-2 grid grid-cols-1 gap-7 min-[920px]:grid-cols-[minmax(0,1.32fr)_minmax(0,1fr)] min-[920px]:items-start min-[920px]:gap-16'>
				<div className='min-[920px]:sticky min-[920px]:top-[96px] min-[920px]:order-2'>
					<h2 className='text-[clamp(32px,4vw,48px)] leading-[1.1] font-[750] tracking-[-0.035em] text-slate-900 text-balance'>
						Before you create an account
					</h2>
					<p className='mt-[14px] max-w-[30em] text-lg leading-[1.65] font-[450] text-slate-600'>
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
							<summary className='flex cursor-pointer list-none items-center justify-between gap-[22px] px-[22px] py-5 text-base font-semibold tracking-[-0.005em] text-slate-900 transition-colors hover:text-blue-700 [&::-webkit-details-marker]:hidden min-[920px]:px-[26px] min-[920px]:py-[22px] min-[920px]:text-lg'>
								{faq.question}
								<span
									className='relative size-4 shrink-0 text-slate-500 group-open:text-primary'
									aria-hidden='true'
								>
									<span className='absolute top-[7.25px] right-0 left-0 h-[1.5px] rounded-[1px] bg-current' />
									<span className='absolute top-0 bottom-0 left-[7.25px] w-[1.5px] rounded-[1px] bg-current transition-[transform,opacity] duration-[180ms] group-open:scale-y-0 group-open:opacity-0' />
								</span>
							</summary>
							<p className='max-w-[48em] px-[22px] pb-[22px] text-sm leading-[1.6] text-slate-600 min-[920px]:px-[26px] min-[920px]:pb-[26px] min-[920px]:text-base min-[920px]:leading-[1.75]'>
								{faq.answer}
							</p>
						</details>
					))}
				</div>
			</div>
		</div>
	)
}
