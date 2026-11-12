import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/utils'

/**
 * Top-lit highlight reserved for the hero CTA and the raised mobile tab action. Always white, so it remains a highlight
 * when the dark theme flips `primary-foreground` to ink.
 */
const PRIMARY_BUTTON_LAYER =
	'relative isolate overflow-hidden before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-b before:from-white/20 before:to-transparent before:opacity-80 before:transition-opacity before:duration-300 before:ease-[cubic-bezier(0.4,0.36,0,1)] after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:bg-gradient-to-b after:from-white/10 after:to-transparent after:mix-blend-overlay'
const SECONDARY_BUTTON_STYLE =
	"ring-1 ring-inset ring-border-outline bg-transparent text-foreground shadow-none hover:bg-background"

const buttonVariants = cva(
	"border border-transparent font-display text-sm font-semibold [&_svg:not([class*='size-'])]:size-4 inline-flex items-center justify-center whitespace-nowrap gap-2 disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-none focus-visible:outline-none select-none transition-[color,background-color,border-color,box-shadow,transform] active:scale-[0.97] motion-reduce:active:scale-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground shadow-none hover:bg-primary-hover active:bg-primary-hover',
				outline: SECONDARY_BUTTON_STYLE,
				// The A1 grey button: `--secondary` surface, blue text and icons, no border or shadow.
				secondary: 'bg-secondary text-secondary-foreground shadow-none hover:bg-secondary-hover',
				ghost: 'hover:bg-secondary hover:text-foreground data-[state=open]:bg-secondary',
				destructive: 'bg-destructive text-destructive-foreground shadow-none hover:bg-destructive-hover active:bg-destructive-hover',
				// Soft red for an action that is allowed but should not shout: tinted fill, red text, no shadow.
				'destructive-soft':
					'bg-feedback-error-subtle text-feedback-error-strong hover:bg-feedback-error-tint dark:bg-feedback-error-subtle dark:text-feedback-error-strong dark:hover:bg-feedback-error-tint',
				// Hero call to action: the primary fill with a blue glow that lifts on hover.
				hero: `bg-primary text-primary-foreground shadow-glow transition-[transform,box-shadow] duration-150 hover:-translate-y-px hover:bg-primary-hover hover:shadow-glow-hover motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${PRIMARY_BUTTON_LAYER}`,
				// The raised round action of the mobile tab bar.
				fab: `bg-primary text-primary-foreground shadow-fab hover:bg-primary-hover ${PRIMARY_BUTTON_LAYER}`,
				// Confirmation of a done action ("Link Copied"): same shape as destructive-soft in green.
				'success-soft':
					'bg-feedback-success-subtle text-feedback-success-strong hover:bg-feedback-success-tint dark:bg-feedback-success-subtle dark:text-feedback-success-strong dark:hover:bg-feedback-success-tint',
				// A quiet icon or row action: slate glyph, the secondary wash on hover and while its menu is open.
				quiet:
					'text-body shadow-none hover:bg-secondary hover:text-foreground data-[state=open]:bg-secondary dark:text-muted-foreground',
				'quiet-destructive':
					'text-body shadow-none hover:bg-secondary hover:text-feedback-error dark:text-muted-foreground',
				// A destructive icon action that is not filled until hovered (remove a photo).
				'destructive-ghost':
					'text-feedback-error shadow-none hover:bg-feedback-error-subtle focus-visible:ring-feedback-error dark:hover:bg-feedback-error-subtle',
				// A text action in the primary colour ("View Details", "View All"): no wash on hover, its arrow nudges right instead.
				'ghost-primary':
					'text-primary shadow-none [&_svg]:transition-transform hover:[&_svg]:translate-x-0.5 motion-reduce:[&_svg]:transition-none',
				// One option of a segmented switch (the sign-in / sign-up control): quiet slate until it is the current page, then a raised white tab.
				segment:
					'text-body shadow-none hover:text-foreground aria-[current=page]:bg-card aria-[current=page]:text-foreground aria-[current=page]:shadow-xs dark:text-muted-foreground',
				// A quiet action over a dark photo (the "Back to Home" link of the phone auth header): white text, a faint wash on hover.
				'quiet-on-dark': 'text-slate-50 shadow-none hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-blue-400',
				// A white action over a dark photo: ink text on a white fill.
				inverse:
					'bg-white text-slate-900 shadow-none hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-400',
				// A white button with the menu shadow that floats over a page (the session Actions button).
				floating: 'bg-card text-blue-700 shadow-menu hover:bg-card dark:text-blue-300',
				// The dark photo viewer: translucent white controls, the darker plate over a photo, and the round arrows.
				'on-dark':
					'bg-white/12 text-white shadow-none hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-40',
				viewer:
					'bg-slate-900/80 text-white shadow-none hover:bg-slate-900 focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-40',
				overlay:
					'bg-white/10 text-white shadow-none hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-30',
				// A drop target that is also a button: the blue dashed invitation, on the muted wash.
				dropzone:
					'border-[1.5px] border-dashed border-primary bg-muted text-blue-700 shadow-none hover:bg-blue-50/60 focus-visible:border-blue-500 data-[dragging=true]:border-blue-500 data-[dragging=true]:bg-blue-50/70 dark:text-blue-400 dark:hover:bg-muted',
				// The smaller drop target beside photos already chosen ("Add More"): a quieter slate dash.
				'dropzone-quiet':
					'border-[1.5px] border-dashed border-slate-400 bg-muted text-blue-700 shadow-none hover:border-blue-500 hover:bg-blue-50/60 focus-visible:border-blue-500 data-[dragging=true]:border-blue-500 dark:border-border dark:text-blue-400 dark:hover:bg-muted',
				// The "add one" row at the end of a list of choices: a dotted blue outline on a faint blue wash.
				'dotted-option':
					'border-[1.5px] border-dotted border-blue-300 bg-blue-50/50 text-blue-700 shadow-none hover:bg-blue-50',
				link: 'text-primary underline-offset-4 hover:underline',
			},
			size: {
				// The visible 32px action keeps a 44px pointer target without changing row layout.
				'quiet-touch': "relative h-8 px-2 text-sm after:absolute after:content-[''] after:-inset-y-1.5 after:inset-x-0",
				xs: "h-6 gap-1 px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
				sm: 'h-8 gap-1 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
				'alert-action': "relative h-8 gap-1 px-3 text-xs after:absolute after:content-[''] after:-inset-y-1.5 after:inset-x-0 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
				'sm-default': "relative h-8 gap-1 px-3 after:absolute after:content-[''] after:-inset-y-1.5 after:inset-x-0 md:static md:h-10 md:gap-1.5 md:px-4 md:after:hidden",
				default:
					"relative h-9 gap-1.5 px-3 after:absolute after:content-[''] after:-inset-y-1 after:inset-x-0 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 md:h-10 md:px-4 md:after:hidden md:has-data-[icon=inline-end]:pr-3 md:has-data-[icon=inline-start]:pl-3",
				lg: 'h-10 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3',
				// The native xl of the library: the touch height of the app (screen toolbars, sheet and form footers, 44px).
				xl: 'h-11 gap-2 px-6 text-base has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4',
				// The 44px touch height with the 14px label of a link-like action (segmented switch, header link on a phone).
				touch: 'h-11 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5',
				// Primary actions use the compact mobile height and the native lg height from md up.
				primary:
					"relative h-9 gap-1.5 px-3 after:absolute after:content-[''] after:-inset-y-1 after:inset-x-0 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 md:h-10 md:gap-1.5 md:px-4 md:after:hidden md:has-data-[icon=inline-end]:pr-3 md:has-data-[icon=inline-start]:pl-3",
				// A labelled control of the dark viewer's top bar (Compare, Done): 44px tall, 16px sides, 8px between icon and label.
				toolbar: 'h-11 gap-2 px-4',
				// A full-width row of a choice list: as tall as its two lines, content at the start.
				option: 'h-auto min-h-14 w-full justify-start gap-3 px-3.5 py-2 text-left whitespace-normal',
				// Link actions follow the same compact mobile height while retaining their link-specific padding.
				'link-action': "relative h-9 gap-1.5 px-3 after:absolute after:content-[''] after:-inset-y-1 after:inset-x-0 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 md:h-10 md:gap-1.5 md:px-3 md:after:hidden",
				// A text link with no padding of its own, so it sits flush with the edge of the row it ends ("View Details").
					'link-inline': 'min-h-8 gap-1 px-0',
					'mobile-action': 'h-11 min-w-0 gap-1 px-1.5 text-xs leading-tight whitespace-normal',
				// The dashboard hero action steps up from the native lg to xl at the tablet breakpoint.
				'hero-action':
					"relative h-9 gap-1.5 px-4 after:absolute after:content-[''] after:-inset-y-1 after:inset-x-0 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 md:h-10 md:gap-2 md:px-6 md:after:hidden md:text-base md:has-data-[icon=inline-end]:pr-4 md:has-data-[icon=inline-start]:pl-4",
				// Hero call to action (52px).
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
			// Label weight: `medium` is the lighter label of the landing header (the base is semibold).
			weight: {
				default: '',
				medium: 'font-medium',
			},
			rounded: {
				default: 'rounded-xl',
				md: 'rounded-md',
				lg: 'rounded-lg',
				xl: 'rounded-xl',
				'2xl': 'rounded-2xl',
				'3xl': 'rounded-3xl',
				full: 'rounded-full',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
			rounded: 'default',
			weight: 'default',
		},
	},
)

function Button({
	className,
	variant = 'default',
	size = 'default',
	rounded = 'default',
	weight = 'default',
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
			data-rounded={rounded}
			className={cn(buttonVariants({ variant, size, rounded, weight, className }))}
			{...props}
		/>
	)
}

type ButtonProps = React.ComponentProps<typeof Button>

export { Button, buttonVariants, PRIMARY_BUTTON_LAYER }
export type { ButtonProps }
