import { CardFooter } from '../ui/card'

interface Props {
	children: React.ReactNode
}

export default function PageFooterAction({ children }: Props) {
	return (
		<div className='fixed lg:hidden inset-x-0 bottom-0 z-50 flex justify-center bg-card/40 backdrop-blur border-t border-border py-3'>
			<CardFooter className='w-full'>{children}</CardFooter>
		</div>
	)
}
