import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/utils'

const SECONDARY_BUTTON_STYLE =
	'border-border bg-background shadow-none hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:bg-transparent dark:hover:bg-input/30'

const buttonVariants = cva(
	"group/button inline-flex shrink-0 items-center justify-center rounded-4xl border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground hover:bg-primary/80',
				outline: SECONDARY_BUTTON_STYLE,
				secondary: 'bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
				segment:
					'text-muted-foreground hover:bg-background/60 aria-[current=page]:bg-white aria-[current=page]:text-primary aria-[current=page]:shadow-sm',
				ghost: 'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50',
				destructive: 'bg-destructive/10 text-feedback-error hover:bg-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30',
				inverse: 'bg-background text-foreground hover:bg-background/90',
				link: 'text-foreground underline-offset-4 hover:underline',
				// A quiet action over a dark photo (the "Back to Home" link of the phone auth header): white text, a faint wash on hover.
				'on-dark': 'bg-white/12 text-white shadow-none hover:bg-white/20 disabled:opacity-40',
				// Transparent text action over a dark photo, such as the auth hero link.
				'on-dark-ghost': 'bg-transparent text-white shadow-none hover:bg-white/12 focus-visible:ring-white/60 disabled:opacity-40',
				// The dark photo viewer: translucent white controls, the darker plate over a photo, and the round arrows.
				viewer: 'bg-slate-900/80 text-white shadow-none hover:bg-slate-900 disabled:opacity-40',
				overlay: 'bg-white/10 text-white shadow-none hover:bg-white/20 disabled:opacity-30',
				// A drop target that is also a button: the blue dashed invitation, on the muted wash.
				dropzone:
					'border-[1.5px] border-dashed border-primary bg-muted text-blue-700 shadow-none hover:bg-blue-50/60 focus-visible:border-blue-500 data-[dragging=true]:border-blue-500 data-[dragging=true]:bg-blue-50/70 dark:text-blue-400 dark:hover:bg-muted',
				// The smaller drop target beside photos already chosen ("Add More"): a quieter slate dash.
				'dropzone-quiet':
					'border-[1.5px] border-dashed border-slate-400 bg-muted text-blue-700 shadow-none hover:border-blue-500 hover:bg-blue-50/60 focus-visible:border-blue-500 data-[dragging=true]:border-blue-500 dark:border-border dark:text-blue-400 dark:hover:bg-muted',
			},
			size: {
				// The visible 32px action keeps a 44px pointer target without changing row layout.
				'quiet-touch': "relative h-8 px-2 text-sm after:absolute after:content-[''] after:-inset-y-1.5 after:inset-x-0",
				xs: "h-6 gap-1 px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
				sm: 'h-8 gap-1 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
				'alert-action': "relative h-8 gap-1 px-3 text-xs after:absolute after:content-[''] after:-inset-y-1.5 after:inset-x-0 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
				default:
					"relative h-9 gap-1.5 px-3 after:absolute after:content-[''] after:-inset-y-1 after:inset-x-0 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 md:after:hidden md:has-data-[icon=inline-end]:pr-3 md:has-data-[icon=inline-start]:pl-3",
				lg: 'h-10 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3',
				// The native xl of the library: the touch height of the app (screen toolbars, sheet and form footers, 44px).
				xl: 'h-11 gap-2 px-6 text-base has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4',
				// The 44px touch height with the 14px label of a link-like action (segmented switch, header link on a phone).
				touch: 'h-11 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5',
				// A labelled control of the dark viewer's top bar (Compare, Done): 44px tall, 16px sides, 8px between icon and label.
				toolbar: 'h-11 gap-2 px-4',
				// A full-width row of a choice list: as tall as its two lines, content at the start.
				option: 'h-auto min-h-14 w-full justify-start gap-3 px-3.5 py-2 text-left whitespace-normal',
				// A flush row action inside a padded card surface; the card owns the side inset.
				row: 'h-auto min-h-14 justify-start gap-3 p-0 text-left whitespace-normal',
				// Link actions follow the same compact mobile height while retaining their link-specific padding.
				'link-action': "relative h-9 gap-1.5 px-3 after:absolute after:content-[''] after:-inset-y-1 after:inset-x-0 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 md:h-10 md:gap-1.5 md:px-3 md:after:hidden",
					'mobile-action': 'h-11 min-w-0 gap-1 px-1.5 text-xs leading-tight whitespace-normal',
				'2xl': 'h-13 gap-2.5 px-7 text-base has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5',
				// Content decides the height: a drop target or any block-shaped action that holds several lines.
				block: 'h-auto min-h-11 flex-col gap-2 px-6 py-6 text-center whitespace-normal',
				// The drop target of the upload sheet (148px) and its square "Add More" sibling (88px).
				dropzone: 'h-auto min-h-37 flex-col gap-2.5 px-4 py-5 text-center whitespace-normal',
				tile: 'size-22 flex-col gap-1 p-0 text-xs leading-none',
				icon: 'size-9',
				'icon-xs': "size-6 [&_svg:not([class*='size-'])]:size-3",
				'icon-sm': 'size-8',
				'icon-lg': 'size-10',
				'icon-xl': 'size-11',
				'icon-2xl': 'size-12',
				// The account trigger: an avatar circle that widens into a pill from `lg` (the content brings its own gap).
				avatar: 'size-11 gap-0 lg:w-auto lg:gap-2.5 lg:pr-2 lg:pl-1',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'lg',
		},
	},
)

function Button({
	className,
	variant = 'default',
	size = 'lg',
	asChild = false,
	...props
}: React.ComponentProps<'button'> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean
	}) {
	const Comp = asChild ? Slot.Root : 'button'

	return (
		<Comp
			data-slot='button'
			data-variant={variant}
			data-size={size}
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	)
}

type ButtonProps = React.ComponentProps<typeof Button>

export { Button, buttonVariants }
export type { ButtonProps }
