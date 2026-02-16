import { Badge } from '@/components/ui/badge'

export function ActiveShoppingBadge() {
	return (
		<Badge className='bg-green-100 text-green-500 flex items-center gap-1.5'>
			<span className='relative flex h-3 w-3'>
				<span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75'></span>
				<span className='relative inline-flex rounded-full h-3 w-3 bg-green-500 border border-green-50 shadow-sm'></span>
			</span>
			Shopping
		</Badge>
	)
}
