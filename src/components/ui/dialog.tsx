'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'

import { cn } from '@/utils'

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Overlay>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Overlay
		ref={ref}
		className={cn(
			'fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
			className,
		)}
		{...props}
	/>
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const CENTERED_ENTER_EXIT =
	'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]'

/** The same panel as a bottom sheet below `sm` (slides up, rounded on top only) and as the centred dialog from `sm`. */
const SHEET_ON_PHONES =
	'max-sm:top-auto max-sm:bottom-0 max-sm:left-0 max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-b-none max-sm:rounded-t-3xl max-sm:max-h-[92dvh] max-sm:overflow-y-auto max-sm:data-[state=closed]:slide-out-to-bottom max-sm:data-[state=open]:slide-in-from-bottom sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:slide-out-to-left-1/2 sm:data-[state=closed]:slide-out-to-top-[48%] sm:data-[state=open]:slide-in-from-left-1/2 sm:data-[state=open]:slide-in-from-top-[48%]'

/** `sheet` is the A1 form panel (sheets and dialogs that hold a form); `viewer` is the dark full-screen surface of the receipt photo. */
const dialogContentVariants = cva('', {
	variants: {
		variant: {
			default: '',
			sheet: 'gap-5 rounded-3xl border-0 p-5 sm:p-6 max-sm:pb-[max(1.5rem,env(safe-area-inset-bottom))]',
			viewer: 'gap-0 rounded-none border-0 bg-ink p-0 text-white',
		},
	},
	defaultVariants: { variant: 'default' },
})

const DialogContent = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> &
		VariantProps<typeof dialogContentVariants> & {
			/** For a surface that draws its own close control, such as a full-screen viewer. */
			hideClose?: boolean
			/** Below `sm` the dialog becomes a bottom sheet, the way a phone expects a form to open. */
			sheetOnPhones?: boolean
		}
>(({ className, children, variant = 'default', hideClose = false, sheetOnPhones = false, ...props }, ref) => (
	<DialogPortal>
		<DialogOverlay />
		<DialogPrimitive.Content
			ref={ref}
			data-variant={variant}
			className={cn(
				'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-card p-6 shadow-xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 rounded-3xl overscroll-contain',
				dialogContentVariants({ variant }),
				sheetOnPhones ? SHEET_ON_PHONES : CENTERED_ENTER_EXIT,
				className,
			)}
			{...props}
		>
			{children}
			{hideClose ? null : (
				<DialogPrimitive.Close className='absolute right-4 top-4 rounded-md opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground'>
					<X className='h-4 w-4' />
					<span className='sr-only'>Close</span>
				</DialogPrimitive.Close>
			)}
		</DialogPrimitive.Content>
	</DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
		{...props}
	/>
)
DialogHeader.displayName = 'DialogHeader'

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
		{...props}
	/>
)
DialogFooter.displayName = 'DialogFooter'

const dialogTitleVariants = cva('', {
	variants: {
		variant: {
			default: 'text-lg font-semibold leading-none tracking-tight',
			// The heading of an A1 form sheet.
			sheet: 'font-display text-xl leading-[1.3] font-semibold tracking-tight text-foreground',
			// A confirmation or a list dialog: bold and tight.
			strong: 'text-lg leading-none font-bold tracking-tight text-foreground',
			// The title bar of the dark viewer.
			viewer: 'font-display text-base leading-none font-bold tracking-normal text-white',
		},
	},
	defaultVariants: { variant: 'default' },
})

const DialogTitle = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Title>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> & VariantProps<typeof dialogTitleVariants>
>(({ className, variant = 'default', ...props }, ref) => (
	<DialogPrimitive.Title
		ref={ref}
		data-variant={variant}
		className={cn(dialogTitleVariants({ variant }), className)}
		{...props}
	/>
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const dialogDescriptionVariants = cva('', {
	variants: {
		variant: {
			default: 'text-sm text-muted-foreground',
			sheet: 'text-sm leading-normal text-slate-500 dark:text-muted-foreground',
		},
	},
	defaultVariants: { variant: 'default' },
})

const DialogDescription = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Description>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description> & VariantProps<typeof dialogDescriptionVariants>
>(({ className, variant = 'default', ...props }, ref) => (
	<DialogPrimitive.Description
		ref={ref}
		data-variant={variant}
		className={cn(dialogDescriptionVariants({ variant }), className)}
		{...props}
	/>
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
	dialogContentVariants,
	dialogTitleVariants,
	dialogDescriptionVariants,
	Dialog,
	DialogPortal,
	DialogOverlay,
	DialogClose,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription,
}
