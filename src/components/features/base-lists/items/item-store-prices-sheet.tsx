'use client'

import { SheetDialog } from '@/components/commons'

import { ItemStorePrices, type ItemStorePricesProps } from './item-store-prices'

export function ItemStorePricesSheet({
	open,
	onOpenChange,
	testId,
	...props
}: ItemStorePricesProps & {
	open: boolean
	onOpenChange: (open: boolean) => void
}) {
	return (
		<SheetDialog
			open={open}
			onOpenChange={onOpenChange}
			title='Prices by Store'
			testId={testId}
		>
			<ItemStorePrices
				testId={testId}
				{...props}
			/>
		</SheetDialog>
	)
}
