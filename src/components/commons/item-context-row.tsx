interface ItemContextRowProps {
	name: string
	testId: string
}

export function ItemContextRow({ name, testId }: ItemContextRowProps) {
	return (
		<div data-testid={testId} className='flex shrink-0 flex-col gap-0.5 rounded-2xl bg-muted px-3 py-2'>
			<span className='text-xs leading-4 font-semibold tracking-wide text-muted-foreground'>ITEM</span>
			<span className='font-mono text-base leading-6 font-medium text-foreground'>{name}</span>
		</div>
	)
}
