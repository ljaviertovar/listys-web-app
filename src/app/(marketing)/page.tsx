import {
	FaqSection,
	GetStartedSection,
	HeroSection,
	HowItWorksSection,
	MemorySection,
	MoneySection,
	ReceiptBandSection,
	RevealObserver,
	SharedListsShowcaseSection,
	Shell,
} from '@/components/marketing/landing-page'
import { Perforation } from '@/components/commons/perforation'

/** The receipt perforation between two sections, inset to the content width. */
function SectionBreak({ testId }: { testId: string }) {
	return (
		<Shell
			testId={testId}
			className='py-1.5'
		>
			<Perforation />
		</Shell>
	)
}

// Order: the promise, the receipt → list mechanic, then what users value most (prices and spending), what it remembers,
// how to start, sharing, the remaining questions and the close.
export default function Page() {
	return (
		<>
			<RevealObserver />
			<HeroSection />
			<div data-testid='home-page-middle'>
				<SectionBreak testId='home-page-break-band' />
				<ReceiptBandSection />
				<SectionBreak testId='home-page-break-money' />
				<MoneySection />
				<SectionBreak testId='home-page-break-memory' />
				<MemorySection />
				<SectionBreak testId='home-page-break-how' />
				<HowItWorksSection />
				<SectionBreak testId='home-page-break-shared' />
				<SharedListsShowcaseSection />
				<SectionBreak testId='home-page-break-faq' />
				<FaqSection />
			</div>
			<SectionBreak testId='home-page-break-close' />
			<GetStartedSection />
		</>
	)
}
