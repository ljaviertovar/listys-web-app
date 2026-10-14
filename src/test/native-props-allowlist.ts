/**
 * Exceptions to the "shadcn-native first" guard (`native-props-guard.test.ts`): places where an element that is not (or cannot be)
 * a library component, or a library component with no prop for it, carries size, shape, colour or typography classes.
 *
 * Every entry says why no prop or variant covers it. Keep the list as short as possible and prefer adding a `size` / `variant`
 * to `components/ui/*` over a new entry. An entry names the file and the element (`tag`); `tokens` narrows it to exact classes.
 *
 * Not listed here because the guard allows them by rule: `Skeleton` (its width, height and radius ARE the placeholder), icon
 * components (their `className` is the glyph size) and layout utilities (width, margin, position, flex/grid placement…).
 */
export interface GuardException {
	/** Path relative to `src/`. */
	file: string
	/** The JSX tag the finding is reported on (`Button`, `button`, `Link`…). */
	tag: string
	/** The class tokens that are allowed; omitted means every class of that element in that file. */
	tokens?: string[]
	reason: string
}

export const GUARD_ALLOWLIST: GuardException[] = [
	{
		file: 'components/features/auth/user-nav.tsx',
		tag: 'Button',
		tokens: ['gap-0', 'lg:gap-2.5'],
		reason: 'The account trigger is an avatar circle on phones and a pill from `lg`; `Button` has no responsive size, so the gap differs per breakpoint.',
	},
	{
		file: 'components/features/auth/auth-buttons.tsx',
		tag: 'Button',
		tokens: ['font-medium'],
		reason: 'The landing header keeps the lighter weight it had before the A1 buttons (the landing must look unchanged).',
	},
	{
		file: 'components/features/tickets/photo/ticket-photo-entry.tsx',
		tag: 'button',
		reason: 'The receipt-photo row is one big pressable card (thumbnail, text, chevron): it is a card surface that happens to be a button, not a Button.',
	},
	{
		file: 'components/features/tickets/photo/ticket-photo-tools.tsx',
		tag: 'button',
		reason: 'A photo thumbnail is the picture itself with a focus ring and dimming; there is no button label, size or variant to speak of.',
	},
	{
		file: 'components/features/tickets/upload/upload-ticket-photos.tsx',
		tag: 'button',
		reason: 'The remove control is a 44px hit area around a 24px dot drawn on the photo corner; the visible part is the inner span, not the button.',
	},
	{
		file: 'components/app/active-session/session-bar.tsx',
		tag: 'Link',
		reason: 'The whole session bar is one link (ring, text, progress and a Continue button inside): a card-shaped link, not a button.',
	},
	{
		file: 'components/app/mobile-tab-bar.tsx',
		tag: 'Link',
		reason: 'A tab of the bottom bar stacks an icon over its label inside a pill: a navigation item, not a Button.',
	},
]
