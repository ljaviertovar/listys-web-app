import { CardFooter } from '../../ui/card'
import { ABOVE_MOBILE_TAB_BAR } from '../helpers/mobile-tab-bar-layout'
import { cn } from '@/utils'

interface Props {
	children: React.ReactNode
}

export default function PageFooterAction({ children }: Props) {
	return (
		<div
			className={cn('fixed lg:hidden inset-x-0 z-50 flex justify-center bg-card/40 backdrop-blur border-t border-border py-3', ABOVE_MOBILE_TAB_BAR)}
			data-testid='page-footer-action'
		>
			<CardFooter className='w-full'>{children}</CardFooter>
		</div>
	)
}
