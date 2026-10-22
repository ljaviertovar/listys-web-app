'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui'

import { cn } from '@/utils'
import { HugeiconsIcon } from '@hugeicons/react'
import { Tick02Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons'

function DropdownMenu({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
	return (
		<DropdownMenuPrimitive.Root
			data-slot='dropdown-menu'
			{...props}
		/>
	)
}

function DropdownMenuPortal({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
	return (
		<DropdownMenuPrimitive.Portal
			data-slot='dropdown-menu-portal'
			{...props}
		/>
	)
}

function DropdownMenuTrigger({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
	return (
		<DropdownMenuPrimitive.Trigger
			data-slot='dropdown-menu-trigger'
			{...props}
		/>
	)
}

/** `menu` is the A1 action menu (a row menu, the session actions); `account` is the larger account menu. */
const dropdownMenuContentVariants = cva('', {
	variants: {
		variant: {
			default: '',
			menu: 'rounded-2xl border-0 bg-card p-1.5 shadow-menu ring-0',
			account: 'rounded-3xl bg-card p-2 shadow-menu-lg ring-0',
		},
	},
	defaultVariants: { variant: 'default' },
})

function DropdownMenuContent({
	className,
	align = 'start',
	sideOffset = 4,
	variant = 'default',
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content> & VariantProps<typeof dropdownMenuContentVariants>) {
	return (
		<DropdownMenuPrimitive.Portal>
			<DropdownMenuPrimitive.Content
				data-slot='dropdown-menu-content'
				data-variant={variant}
				sideOffset={sideOffset}
				align={align}
				className={cn(
					'data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/5 bg-popover text-popover-foreground min-w-48 rounded-xl p-1 shadow-lg ring-1 duration-100 z-50 max-h-(--radix-dropdown-menu-content-available-height) w-(--radix-dropdown-menu-trigger-width) origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto data-[state=closed]:overflow-hidden',
					dropdownMenuContentVariants({ variant }),
					className,
				)}
				{...props}
			/>
		</DropdownMenuPrimitive.Portal>
	)
}

function DropdownMenuGroup({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
	return (
		<DropdownMenuPrimitive.Group
			data-slot='dropdown-menu-group'
			{...props}
		/>
	)
}

/** `touch` is a 44px action row; `row` a 52px link row with an icon tile; `action` a filled secondary row (Sign Out). */
const dropdownMenuItemSizes = {
	default: '',
	touch: 'min-h-11 cursor-pointer font-display font-semibold',
	row: 'min-h-13 gap-3 rounded-xl px-2.5 py-2',
	action: 'mx-0.5 mb-0.5 min-h-11 justify-center gap-2 rounded-xl bg-secondary font-display font-semibold dark:bg-muted',
}

function DropdownMenuItem({
	className,
	inset,
	variant = 'default',
	size = 'default',
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
	inset?: boolean
	variant?: 'default' | 'destructive'
	size?: keyof typeof dropdownMenuItemSizes
}) {
	return (
		<DropdownMenuPrimitive.Item
			data-slot='dropdown-menu-item'
			data-inset={inset}
			data-variant={variant}
			data-size={size}
			className={cn(
				"focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:text-destructive not-data-[variant=destructive]:focus:**:text-accent-foreground gap-2.5 rounded-lg px-3 py-2 text-sm [&_svg:not([class*='size-'])]:size-4 group/dropdown-menu-item relative flex cursor-default items-center outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0",
				dropdownMenuItemSizes[size],
				className,
			)}
			{...props}
		/>
	)
}

function DropdownMenuCheckboxItem({
	className,
	children,
	checked,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
	return (
		<DropdownMenuPrimitive.CheckboxItem
			data-slot='dropdown-menu-checkbox-item'
			className={cn(
				"focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground gap-2.5 rounded-lg py-2 pr-8 pl-3 text-sm [&_svg:not([class*='size-'])]:size-4 relative flex cursor-default items-center outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
				className,
			)}
			checked={checked}
			{...props}
		>
			<span
				className='pointer-events-none absolute right-2 flex items-center justify-center pointer-events-none'
				data-slot='dropdown-menu-checkbox-item-indicator'
			>
				<DropdownMenuPrimitive.ItemIndicator>
					<HugeiconsIcon
						icon={Tick02Icon}
						strokeWidth={2}
					/>
				</DropdownMenuPrimitive.ItemIndicator>
			</span>
			{children}
		</DropdownMenuPrimitive.CheckboxItem>
	)
}

function DropdownMenuRadioGroup({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
	return (
		<DropdownMenuPrimitive.RadioGroup
			data-slot='dropdown-menu-radio-group'
			{...props}
		/>
	)
}

function DropdownMenuRadioItem({
	className,
	children,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
	return (
		<DropdownMenuPrimitive.RadioItem
			data-slot='dropdown-menu-radio-item'
			className={cn(
				"focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground gap-2.5 rounded-lg py-2 pr-8 pl-3 text-sm [&_svg:not([class*='size-'])]:size-4 relative flex cursor-default items-center outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
				className,
			)}
			{...props}
		>
			<span
				className='pointer-events-none absolute right-2 flex items-center justify-center pointer-events-none'
				data-slot='dropdown-menu-radio-item-indicator'
			>
				<DropdownMenuPrimitive.ItemIndicator>
					<HugeiconsIcon
						icon={Tick02Icon}
						strokeWidth={2}
					/>
				</DropdownMenuPrimitive.ItemIndicator>
			</span>
			{children}
		</DropdownMenuPrimitive.RadioItem>
	)
}

function DropdownMenuLabel({
	className,
	inset,
	variant = 'default',
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
	inset?: boolean
	/** `identity` is the account header: the avatar beside a name and an email. */
	variant?: 'default' | 'identity'
}) {
	return (
		<DropdownMenuPrimitive.Label
			data-slot='dropdown-menu-label'
			data-inset={inset}
			className={cn('text-muted-foreground px-3 py-2.5 text-xs data-[inset]:pl-8', variant === 'identity' && 'flex items-center gap-3 px-2.5 pt-2.5 pb-3 font-normal', className)}
			{...props}
		/>
	)
}

function DropdownMenuSeparator({
	className,
	variant = 'default',
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator> & { variant?: 'default' | 'solid' }) {
	return (
		<DropdownMenuPrimitive.Separator
			data-slot='dropdown-menu-separator'
			className={cn('-mx-1 my-1 h-px', variant === 'solid' ? 'bg-border' : 'bg-border/50', className)}
			{...props}
		/>
	)
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<'span'>) {
	return (
		<span
			data-slot='dropdown-menu-shortcut'
			className={cn(
				'text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground ml-auto text-xs tracking-widest',
				className,
			)}
			{...props}
		/>
	)
}

function DropdownMenuSub({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
	return (
		<DropdownMenuPrimitive.Sub
			data-slot='dropdown-menu-sub'
			{...props}
		/>
	)
}

function DropdownMenuSubTrigger({
	className,
	inset,
	children,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
	inset?: boolean
}) {
	return (
		<DropdownMenuPrimitive.SubTrigger
			data-slot='dropdown-menu-sub-trigger'
			data-inset={inset}
			className={cn(
				"focus:bg-accent focus:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground gap-2 rounded-lg px-3 py-2 text-sm [&_svg:not([class*='size-'])]:size-4 flex cursor-default items-center outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0",
				className,
			)}
			{...props}
		>
			{children}
			<HugeiconsIcon
				icon={ArrowRight01Icon}
				strokeWidth={2}
				className='ml-auto'
			/>
		</DropdownMenuPrimitive.SubTrigger>
	)
}

function DropdownMenuSubContent({
	className,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
	return (
		<DropdownMenuPrimitive.SubContent
			data-slot='dropdown-menu-sub-content'
			className={cn(
				'data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/5 bg-popover text-popover-foreground min-w-36 rounded-xl p-1 shadow-lg ring-1 duration-100 z-50 origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden',
				className,
			)}
			{...props}
		/>
	)
}

export { dropdownMenuContentVariants, dropdownMenuItemSizes }

export {
	DropdownMenu,
	DropdownMenuPortal,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuItem,
	DropdownMenuCheckboxItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubTrigger,
	DropdownMenuSubContent,
}
