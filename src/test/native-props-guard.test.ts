import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'

import { GUARD_ALLOWLIST } from './native-props-allowlist'

/**
 * "shadcn-native first": a library component takes its size, shape, colour and typography from its props (`size`, `variant`,
 * `rounded`, `tone`…). A call site may only pass layout classes (width, margin, position, flex/grid placement…); anything else
 * beats the prop through tailwind-merge, which is how `size` stopped working on the A1 buttons.
 *
 * The scan itself lives in `src/test/native-props-scan.cjs` (TypeScript compiler API, no hand-written component list): it covers every
 * component imported from `@/components/ui/*`, the wrappers that forward to them (computed), `className` through any `*ClassName`
 * prop, `cn()`, templates, ternaries and constants (also imported ones), `buttonVariants()` outside `ui`, hand-styled native
 * `<button>/<input>/<textarea>/<select>`, links dressed as buttons, classes on the child of an `asChild` component, wrappers that
 * take `ButtonProps` and drop them, and `size`/`variant`/`rounded` written after `{...props}`.
 */
interface Finding {
	file: string
	line: number
	kind: string
	tag: string
	attr: string
	tokens: string[]
}
interface Wrapper {
	name: string
	file: string
	takesButtonProps: boolean
}
const { scan } = createRequire(import.meta.url)('./native-props-scan.cjs') as {
	scan: (root?: string) => { findings: Finding[]; wrappers: Wrapper[] }
}

const result = scan()

function covered(finding: Finding) {
	return GUARD_ALLOWLIST.some(
		entry =>
			entry.file === finding.file &&
			(entry.tag === finding.tag || finding.tag.endsWith(`> ${entry.tag}`)) &&
			(!entry.tokens || finding.tokens.every(token => entry.tokens!.includes(token))),
	)
}

describe('shadcn-native props: the code', () => {
	it('keeps size, shape, colour and typography off the className of library components and their wrappers', () => {
		const offenders = result.findings.filter(finding => !covered(finding))

		expect(
			offenders.map(f => `${f.file}:${f.line} [${f.kind}] <${f.tag}> ${f.attr} ${f.tokens.join(' ')}`),
			'Use the component props (size, variant, rounded, tone…) or add a variant/size to components/ui; see AGENTS.md "shadcn-native first".',
		).toEqual([])
	})

	it('has no allowlist entry that is stale or missing its reason', () => {
		for (const entry of GUARD_ALLOWLIST) {
			expect(entry.reason.length, `${entry.file} <${entry.tag}> needs a reason`).toBeGreaterThan(30)
			const live = result.findings.some(
				f =>
					f.file === entry.file &&
					(entry.tag === f.tag || f.tag.endsWith(`> ${entry.tag}`)) &&
					(!entry.tokens || f.tokens.some(token => entry.tokens!.includes(token))),
			)
			expect(live, `${entry.file} <${entry.tag}> is no longer flagged: remove it from the allowlist`).toBe(true)
		}
	})

	it('finds the wrappers by itself, including wrappers of wrappers', () => {
		const names = result.wrappers.map(w => w.name)

		expect(names).toEqual(expect.arrayContaining(['CreateGroupDialog', 'StartShoppingDialog', 'ShareListDialog', 'AddItemSheet', 'UploadTicketDialog']))
		// ItemFields forwards to a field that forwards to Input: it only counts when the fixpoint works.
		expect(names).toContain('SheetDialog')
	})
})

describe('shadcn-native props: the scanner catches each class of mistake', () => {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'native-props-'))
	const write = (name: string, source: string) => {
		fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true })
		fs.writeFileSync(path.join(dir, name), source)
	}

	write('styles.ts', "export const FANCY = 'px-6 bg-red-500 text-white'\n")
	write(
		'app/page.tsx',
		`import { Button, buttonVariants, type ButtonProps } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { cn } from '@/utils'
import { FANCY } from '../styles'

/** A wrapper that spreads its props and then overrides the size: the caller's size never wins. */
export function Overrides({ children, ...rest }: ButtonProps) {
	return <Button {...rest} size='sm'>{children}</Button>
}
/** A wrapper that takes ButtonProps and throws them away. */
export function Drops({ children, ...rest }: ButtonProps) {
	return <Button size='xs'>{children}</Button>
}
/** A good wrapper: a default before the spread, layout class only. */
export function Good({ children, ...rest }: ButtonProps) {
	return <Button size='xl' {...rest}>{children}</Button>
}
/** A wrapper of a wrapper. */
export function Outer(props: ButtonProps) {
	return <Good {...props} />
}

export default function Page() {
	return (
		<div>
			<Button className='h-12 rounded-lg'>ui class</Button>
			<Label className={cn('text-sm', 'font-semibold')}>cn()</Label>
			<Button className={FANCY}>imported constant</Button>
			<Progress value={1} indicatorClassName='bg-green-500' />
			<Outer className='h-9 bg-blue-600'>wrapper of a wrapper</Outer>
			<button className='h-11 rounded-xl bg-white/10 px-3'>native</button>
			<Link href='/x' className='inline-flex h-11 rounded-xl bg-secondary px-4'>link as button</Link>
			<span className={buttonVariants({ size: 'sm' })}>variants</span>
			<Button asChild><a className='h-10 rounded-lg bg-primary'>child</a></Button>
			<Button className='w-full mt-2'>layout only</Button>
			<Card><CardContent className='space-y-4 pt-6'>container spacing</CardContent></Card>
			<Skeleton className='h-4 w-24 rounded-md' />
			<HugeiconsIcon icon={null as never} className='size-5 text-red-600' />
		</div>
	)
}
`,
	)
	const fixture = scan(dir)
	afterAll(() => {
		fs.rmSync(dir, { recursive: true, force: true })
		scan() // restore the module's root to the real src for any later caller
	})

	const find = (kind: string, tag?: string) => fixture.findings.filter(f => f.kind === kind && (!tag || f.tag === tag))

	it('flags a class on a library component, through cn(), an imported constant and any *ClassName prop', () => {
		expect(find('ui', 'Button').flatMap(f => f.tokens)).toEqual(expect.arrayContaining(['h-12', 'rounded-lg', 'px-6', 'bg-red-500']))
		expect(find('ui', 'Label').flatMap(f => f.tokens)).toEqual(expect.arrayContaining(['text-sm', 'font-semibold']))
		expect(find('ui', 'Progress').flatMap(f => f.tokens)).toContain('bg-green-500')
	})

	it('flags a class passed to a wrapper, also a wrapper of a wrapper', () => {
		expect(find('wrapper', 'Outer').flatMap(f => f.tokens)).toEqual(expect.arrayContaining(['h-9', 'bg-blue-600']))
	})

	it('flags a wrapper that overrides or drops the props it was given', () => {
		expect(find('prop-after-spread').map(f => f.tag)).toEqual(['Button'])
		expect(find('drops-props').map(f => f.tag)).toEqual(['Drops'])
	})

	it('flags hand-styled natives, links dressed as buttons, buttonVariants() and classes on an asChild child', () => {
		expect(find('native', 'button')).toHaveLength(1)
		expect(find('button-like', 'Link')).toHaveLength(1)
		expect(find('buttonVariants')).toHaveLength(1)
		expect(find('asChild')).toHaveLength(1)
	})

	it('flags the padding and gap of containers, and lets layout classes, skeleton shapes and icon sizes through', () => {
		const flagged = fixture.findings.map(f => f.tag)

		expect(find('ui', 'CardContent').flatMap(f => f.tokens)).toEqual(expect.arrayContaining(['space-y-4', 'pt-6']))
		expect(flagged).not.toContain('Skeleton')
		expect(flagged).not.toContain('HugeiconsIcon')
		expect(fixture.findings.filter(f => f.tokens.some(t => t === 'w-full' || t === 'mt-2'))).toEqual([])
	})
})
