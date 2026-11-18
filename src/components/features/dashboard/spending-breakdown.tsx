'use client'

import { Label, Pie, PieChart } from 'recharts'

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { formatCurrency } from '@/utils'
import type { SpendingSlice } from './helpers/spending-slices'

/** One entry per slice: the chart reads `color` (the dark theme moves to the lighter blues), the legend swatch reads `swatch`. */
const SLICE_STYLES: Record<string, { color: string | { light: string; dark: string }; swatch: string }> = {
	'store-0': { color: { light: 'var(--chart-4)', dark: 'var(--chart-2)' }, swatch: 'bg-chart-4 dark:bg-chart-2' },
	'store-1': { color: { light: 'var(--chart-2)', dark: 'var(--chart-3)' }, swatch: 'bg-chart-2 dark:bg-chart-3' },
	'store-2': { color: { light: 'var(--chart-1)', dark: 'var(--chart-1)' }, swatch: 'bg-chart-1' },
	other: { color: 'color-mix(in oklch, var(--muted-foreground) 45%, transparent)', swatch: 'bg-muted-foreground/45' },
}

interface SpendingBreakdownProps {
	slices: SpendingSlice[]
	total: number
	receiptCount: number
	testId: string
}

function buildConfig(slices: SpendingSlice[]): ChartConfig {
	return Object.fromEntries(
		slices.map(slice => {
			const { color } = SLICE_STYLES[slice.key]
			return [slice.key, typeof color === 'object' ? { label: slice.name, theme: color } : { label: slice.name, color }]
		}),
	)
}

function otherLabel(slice: SpendingSlice) {
	return slice.storeCount > 0 ? `${slice.name} · ${slice.storeCount} ${slice.storeCount === 1 ? 'store' : 'stores'}` : slice.name
}

/**
 * The month's spend by store: the shadcn donut with the total and the receipt count in its hole, and the legend under it. Every
 * fact is said once here, so the card around it adds only what the chart does not show.
 */
export function SpendingBreakdown({ slices, total, receiptCount, testId }: SpendingBreakdownProps) {
	const config = buildConfig(slices)
	const data = slices.map(slice => ({ key: slice.key, total: slice.total, fill: `var(--color-${slice.key})` }))
	const summary = `Spend by store: ${slices.map(slice => `${slice.name} ${slice.percent}%`).join(', ')}`

	return (
		<div data-testid={testId} className='flex flex-col gap-3.5'>
			<ChartContainer
				id='month-spending'
				config={config}
				role='img'
				aria-label={summary}
				data-testid={`${testId}-chart`}
				className='mx-auto aspect-square h-50'
			>
				<PieChart>
					<ChartTooltip
						cursor={false}
						content={
							<ChartTooltipContent
								hideLabel
								nameKey='key'
								formatter={(value, _name, item) => {
									const slice = slices.find(entry => entry.key === item.payload?.key)
									return (
										<>
											<span aria-hidden='true' className={`size-2.5 shrink-0 rounded-[2px] ${slice ? SLICE_STYLES[slice.key].swatch : ''}`} />
											<span className='flex-1 text-muted-foreground'>{slice ? otherLabel(slice) : ''}</span>
											<span className='font-mono font-medium text-foreground tabular-nums'>{formatCurrency(Number(value))}</span>
										</>
									)
								}}
							/>
						}
					/>
					<Pie
						data={data}
						dataKey='total'
						nameKey='key'
						innerRadius={66}
						outerRadius={96}
						stroke='var(--card)'
						strokeWidth={2}
						isAnimationActive={false}
					>
						<Label
							content={({ viewBox }) => {
								if (!viewBox || !('cx' in viewBox) || !('cy' in viewBox)) return null
								return (
									<text x={viewBox.cx} y={viewBox.cy} textAnchor='middle' dominantBaseline='middle'>
										<tspan x={viewBox.cx} y={(viewBox.cy ?? 0) - 6} className='fill-foreground font-mono text-xl font-semibold tracking-tight'>
											{formatCurrency(total)}
										</tspan>
										<tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 14} className='fill-muted-foreground text-xs'>
											{receiptCount} {receiptCount === 1 ? 'receipt' : 'receipts'}
										</tspan>
									</text>
								)
							}}
						/>
					</Pie>
				</PieChart>
			</ChartContainer>
			<ul className='flex flex-col gap-1.5'>
				{slices.map(slice => (
					<li key={slice.key} className='flex items-center gap-2 text-sm'>
						<span aria-hidden='true' className={`size-2.5 shrink-0 rounded-sm ${SLICE_STYLES[slice.key].swatch}`} />
						<span className='min-w-0 flex-1 truncate'>
							{slice.key === 'other' ? (
								<>
									{slice.name}
									{slice.storeCount > 0 ? <span className='text-muted-foreground'> · {slice.storeCount} {slice.storeCount === 1 ? 'store' : 'stores'}</span> : null}
								</>
							) : (
								slice.name
							)}
						</span>
						<span className='w-9 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground'>{slice.percent}%</span>
						<span className='w-[5.25rem] shrink-0 text-right font-mono font-semibold tabular-nums'>{formatCurrency(slice.total)}</span>
					</li>
				))}
			</ul>
		</div>
	)
}
