import { ReactNode } from 'react'

interface Props {
	children: ReactNode
}

export default function PageContainer({ children }: Props) {
	return <div className='container mx-auto max-w-7xl space-y-6 px-3 py-6 lg:px-4 l'>{children}</div>
}
