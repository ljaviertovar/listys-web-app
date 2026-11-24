'use client'

import { Progress as ProgressPrimitive } from 'radix-ui'
import { Label, PolarAngleAxis, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart } from 'recharts'

import { ChartContainer, type ChartConfig } from '@/components/ui/chart'

type TripProgressChartProps = {
	checked: number
	total: number
	label: string
	testId?: string
}

// The bar takes the lighter blue in dark, which keeps its contrast on the dark card; a finished trip turns it success green.
const CHART_CONFIG = {
	progress: { label: 'Collected', theme: { light: 'var(--chart-4)', dark: 'var(--chart-2)' } },
	done: { label: 'All collected', color: 'var(--feedback-success)' },
} satisfies ChartConfig

/**
 * The shadcn "Radial Chart – Shape" for a trip: a thick bar riding on a thin ring with the count in the hole. The geometry
 * is the shadcn example scaled to 112px. It stays decorative while the parent exposes the progress semantics.
 */
export function TripProgressChart({ checked, total, label, testId = 'trip-progress-chart' }: TripProgressChartProps) {
	const percent = total > 0 ? Math.min(100, Math.max(0, Math.round((checked / total) * 100))) : 0
	const key = percent === 100 ? 'done' : 'progress'

	return (
		<ProgressPrimitive.Root
			data-slot='trip-progress-chart'
			data-testid={testId}
			value={percent}
			aria-label={label}
			getValueLabel={() => `${checked} of ${total} ${total === 1 ? 'item' : 'items'}`}
			className='relative size-28 shrink-0'
		>
			<div aria-hidden='true' className='absolute inset-0'>
				<ChartContainer config={CHART_CONFIG} className='aspect-square size-full'>
					<RadialBarChart data={[{ key, value: percent, fill: `var(--color-${key})` }]} startAngle={90} endAngle={-270} innerRadius={29} outerRadius={43}>
						<PolarGrid gridType='circle' radialLines={false} stroke='none' className='first:fill-border last:fill-card' polarRadius={[38.5, 33]} />
						<PolarAngleAxis type='number' domain={[0, 100]} dataKey='value' tick={false} axisLine={false} />
						<RadialBar dataKey='value' isAnimationActive={false} />
						<PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
							<Label
								content={({ viewBox }) => {
									if (!viewBox || !('cx' in viewBox) || !('cy' in viewBox)) return null
									return (
										<text x={viewBox.cx} y={viewBox.cy} textAnchor='middle' dominantBaseline='middle'>
											<tspan x={viewBox.cx} y={(viewBox.cy ?? 0) - 4} className='fill-foreground font-mono text-[22px] font-medium tracking-tight'>
												{checked}
											</tspan>
											<tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 14} className='fill-muted-foreground text-[11px]'>
												of {total}
											</tspan>
										</text>
									)
								}}
							/>
						</PolarRadiusAxis>
					</RadialBarChart>
				</ChartContainer>
			</div>
		</ProgressPrimitive.Root>
	)
}
