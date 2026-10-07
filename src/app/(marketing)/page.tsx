import {
	FaqSection,
	FeaturesSection,
	GetStartedSection,
	HeroSection,
	HowItWorksSection,
	SectionWrapper,
	SharedListsShowcaseSection,
} from '@/components/marketing/landing-page'

export default function Page() {
	return (
		<>
			<SectionWrapper
				testId='home-page-hero'
				width='full'
			>
				<HeroSection />
			</SectionWrapper>

			<SectionWrapper
				id='how-it-works'
				testId='home-page-how-it-works'
				className='overflow-hidden bg-white'
			>
				<HowItWorksSection />
			</SectionWrapper>

			<SectionWrapper
				id='features'
				testId='home-page-features'
				className='bg-slate-50'
			>
				<FeaturesSection />
			</SectionWrapper>

			<SectionWrapper
				id='shared-lists'
				testId='home-page-shared-lists'
				className='bg-white'
			>
				<SharedListsShowcaseSection />
			</SectionWrapper>

			<SectionWrapper
				id='faq'
				testId='home-page-faq'
				className='bg-slate-50'
			>
				<FaqSection />
			</SectionWrapper>

			<SectionWrapper
				id='get-started'
				testId='home-page-get-started'
				className='bg-[linear-gradient(90deg,rgba(8,13,26,.95)_0%,rgba(8,13,26,.9)_44%,rgba(8,13,26,.5)_100%),url(/images/landing/close-bg.jpg)] bg-cover bg-center py-20 max-[759px]:bg-[linear-gradient(180deg,rgba(8,13,26,.93)_0%,rgba(8,13,26,.88)_100%),url(/images/landing/close-bg.jpg)] min-[900px]:py-[110px]'
			>
				<GetStartedSection />
			</SectionWrapper>
		</>
	)
}
