'use client'

import { motion } from 'framer-motion'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const faqs = [
	{
		question: 'Do I have to retype my shopping list every week?',
		answer:
			"No — that's exactly what Listys eliminates. Scan any receipt once and Listys extracts every item automatically. Those items are saved to a reusable base list, so your next shopping trip starts fully pre-filled. The more you use it, the smarter your list gets.",
	},
	{
		question: 'What if the scan misses an item or gets a name wrong?',
		answer:
			"You always review extracted items before they're saved. Every field is editable — you can correct names, adjust quantities, or remove anything that didn't scan correctly. Listys is designed to be fast to review, not a black box you have to trust blindly.",
	},
	{
		question: 'How does a shopping session work?',
		answer:
			"When you're ready to shop, you start a session from any base list. Listys clones it so your original stays intact. During the trip you check off items as you go. When you finish, you can optionally sync changes back — so new items or adjustments automatically improve your list for next time.",
	},
	{
		question: 'Can multiple people use the same list?',
		answer:
			"Yes. You can create a shared group and invite family members or roommates. Everyone sees the same list in real time — if one person checks off milk, it's checked off for everyone. No more duplicated items or out-of-sync notes.",
	},
]
const REVEAL_VIEWPORT = { once: true, amount: 0.22 }
const FADE_UP = {
	hidden: { opacity: 0, y: 16 },
	show: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.45, ease: 'easeOut' as const },
	},
} as const

export function Faq() {
	return (
		<motion.section
			className='relative w-full overflow-hidden py-20'
			id='faq'
			initial='hidden'
			whileInView='show'
			viewport={REVEAL_VIEWPORT}
		>
			<div className='pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/80 to-transparent' />
			<div className='pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/80 to-transparent' />
			<div className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8'>
				<motion.div
					className='text-center mb-12 space-y-4'
					variants={FADE_UP}
				>
					<h2 className='font-serif text-3xl font-extrabold tracking-[-0.015em] text-slate-900 md:text-4xl'>
						Frequently Asked Questions
					</h2>
					<p className='text-lg text-slate-700'>Quick answers before you create your account.</p>
				</motion.div>

				<Accordion
					type='single'
					collapsible
					className='w-full space-y-4 border-none shadow-none rounded-none bg-transparent'
				>
					{faqs.map((faq, index) => (
						<motion.div
							key={faq.question}
							variants={FADE_UP}
							transition={{ delay: index * 0.05 }}
						>
							<AccordionItem
								value={`item-${index}`}
								className='bg-white backdrop-blur-md border border-slate-200/50 rounded-xl px-2 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300/50 data-[state=open]:shadow-md data-[state=open]:border-primary/20'
							>
								<AccordionTrigger className=' text-lg font-medium text-slate-900 hover:text-primary transition-colors duration-200 hover:no-underline py-5 px-4'>
									{faq.question}
								</AccordionTrigger>
								<AccordionContent className=' text-slate-700 text-base leading-relaxed pb-5 px-4'>
									{faq.answer}
								</AccordionContent>
							</AccordionItem>
						</motion.div>
					))}
				</Accordion>
			</div>
		</motion.section>
	)
}
