import { Badge } from '@/components/ui/badge'

export function ActiveShoppingBadge() {
	return (
		<Badge className='bg-green-100 text-green-500 flex items-center gap-1.5'>
			<span className='h-2 w-2 rounded-full bg-green-500 animate-pulse' />
			Shopping
		</Badge>
	)
}
