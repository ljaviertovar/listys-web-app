import { ReactNode } from 'react'

interface Props {
	children: ReactNode
}

export default function PageContainer({ children }: Props) {
	return <div className='container mx-auto max-w-7xl space-y-6 p-3 lg:p-4'>{children}</div>
}
