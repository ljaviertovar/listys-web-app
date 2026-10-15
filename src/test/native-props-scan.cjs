/* eslint-disable @typescript-eslint/no-require-imports -- a CommonJS module the tests load with createRequire */
/**
 * "shadcn-native first" scanner (CommonJS so the CLI and the vitest guard share it).
 *
 * It reads every `.tsx` under `src/` with the TypeScript compiler API and reports the classes a call site puts on a library
 * component (or on a wrapper that forwards to one) that decide size, shape, colour or typography. Those belong to the component's
 * props/variants (`components/ui/*`) or to a token, never to a per-call class string.
 *
 * What it covers, with no hand-written component list:
 *   - every component imported from `@/components/ui/*` (per file);
 *   - wrappers: local components that forward props or `className` to one of those (computed to a fixpoint, so wrappers of wrappers count);
 *   - className given through any attribute whose name ends in `className`/`ClassName`, through `cn()`, template strings, ternaries,
 *     `&&`, arrays, local constants and constants imported from other files;
 *   - `buttonVariants(...)` outside `components/ui` (a link or native button imitating a Button);
 *   - native `<button>`, `<input>`, `<textarea>`, `<select>` styled by hand;
 *   - classes on the child of an `asChild` library component.
 *
 * CLI: `node src/test/native-props-scan.cjs [--json]`.
 */
const fs = require('fs')
const path = require('path')
const ts = require('typescript')

const DEFAULT_SRC = path.resolve(__dirname, '..')
let SRC = DEFAULT_SRC

/**
 * Utilities that decide how a library part looks: size, spacing, shape, colour, typography. Containers (CardContent, DialogFooter,
 * SidebarMenu...) are no exception: their padding and gap are theme too and come from a `size`/`variant`/`spacing` prop.
 */
const CONTROL_FORBIDDEN = [
	/^h-(\d|\[)/, /^size-(\d|\[)/, /^(p|px|py|pt|pb)-/, /^gap(-[xy])?-/, /^space-[xy]-/, /^rounded(-|$)/, /^bg-/, /^from-|^to-|^via-/,
	/^text-(xs|sm|base|lg|xl|[2-9]xl|\[|(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black|primary|secondary|muted|accent|destructive|foreground|card|background|ink)\b)/,
	/^font-/, /^(leading|tracking)-/, /^(uppercase|lowercase|capitalize|italic)$/, /^border(-|$)/, /^(ring|outline)(-|$)/, /^shadow(-|$)/, /^(opacity|backdrop|blur)-/,
]
/** Shape-is-the-content parts: a placeholder's size and radius ARE what it draws. */
const SHAPE_PARTS = new Set(['Skeleton'])
/** Elements imported from icon libraries: their className is a glyph size. */
const ICON_PACKAGES = ['@hugeicons/', 'lucide-react']

const NATIVE = new Set(['button', 'input', 'textarea', 'select'])

const core = t => t.replace(/^(?:(?:[\w-]+(?:\[[^\]]+\])?|\[[^\]]+\])(?:\/[\w-]+)?:)+/, '').replace(/^!/, '').replace(/^-/, '')

function walk(dir, out = []) {
	for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
		const f = path.join(dir, e.name)
		if (e.isDirectory()) {
			if (!['node_modules', 'tests', 'test', 'design-check'].includes(e.name)) walk(f, out)
		} else if (e.name.endsWith('.tsx') || e.name.endsWith('.ts')) out.push(f)
	}
	return out
}

function parse(file) {
	const text = fs.readFileSync(file, 'utf8')
	return ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS)
}

const rel = f => path.relative(SRC, f).replace(/\\/g, '/')
const isUiFile = r => r.startsWith('components/ui/')
const isExemptArea = r => r.startsWith('components/marketing/') || r.startsWith('app/(marketing)/') || r.startsWith('components/ui/')

function resolveModule(from, spec) {
	let base
	if (spec.startsWith('@/')) base = path.join(SRC, spec.slice(2))
	else if (spec.startsWith('.')) base = path.resolve(path.dirname(from), spec)
	else return null
	for (const c of [base + '.ts', base + '.tsx', path.join(base, 'index.ts'), path.join(base, 'index.tsx')]) if (fs.existsSync(c)) return c
	return null
}

function scan(root = DEFAULT_SRC) {
	SRC = root
	const files = walk(SRC)
	const sources = new Map(files.map(f => [f, parse(f)]))
	const info = new Map() // file -> { imports:Map(name->{spec,orig}), consts:Map(name->node), uiNames:Set, iconNames:Set }

	for (const [file, sf] of sources) {
		const imports = new Map()
		const consts = new Map()
		const uiNames = new Set()
		const iconNames = new Set()
		const visit = n => {
			if (ts.isImportDeclaration(n) && n.importClause) {
				const spec = n.moduleSpecifier.text
				const b = n.importClause.namedBindings
				const add = (local, orig) => {
					imports.set(local, { spec, orig })
					if (spec.startsWith('@/components/ui/')) uiNames.add(local)
					if (ICON_PACKAGES.some(p => spec.startsWith(p))) iconNames.add(local)
				}
				if (n.importClause.name) add(n.importClause.name.text, 'default')
				if (b && ts.isNamedImports(b)) b.elements.forEach(e => add(e.name.text, (e.propertyName || e.name).text))
			}
			if (ts.isVariableDeclaration(n) && n.initializer && ts.isIdentifier(n.name)) consts.set(n.name.text, n.initializer)
			ts.forEachChild(n, visit)
		}
		visit(sf)
		info.set(file, { imports, consts, uiNames, iconNames })
	}

	// strings reachable from an expression: literals, templates, cn(), ternaries, arrays, local and imported constants
	function strings(file, node, depth = 0, out = [], seen = new Set()) {
		if (!node || depth > 8) return out
		const fi = info.get(file)
		if (ts.isStringLiteralLike(node)) out.push(node.text)
		else if (ts.isTemplateExpression(node)) {
			out.push(node.head.text)
			node.templateSpans.forEach(s => { strings(file, s.expression, depth + 1, out, seen); out.push(s.literal.text) })
		} else if (ts.isIdentifier(node)) {
			const key = file + '::' + node.text
			if (seen.has(key)) return out
			seen.add(key)
			if (fi.consts.has(node.text)) strings(file, fi.consts.get(node.text), depth + 1, out, seen)
			else if (fi.imports.has(node.text)) {
				const target = resolveModule(file, fi.imports.get(node.text).spec)
				if (target && info.has(target)) {
					const tn = info.get(target).consts.get(fi.imports.get(node.text).orig)
					if (tn) strings(target, tn, depth + 1, out, seen)
				}
			}
		} else if (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) {
			// STYLES.key: resolve the object constant and collect every string in it (conservative)
			const base = ts.isPropertyAccessExpression(node) ? node.expression : node.expression
			strings(file, base, depth + 1, out, seen)
		} else ts.forEachChild(node, c => { strings(file, c, depth + 1, out, seen) }) // no return: a truthy value would stop forEachChild
		return out
	}

	// ---- wrapper detection (fixpoint) ----
	const wrappers = new Map() // name -> file
	const componentDecls = [] // { file, name, node }
	for (const [file, sf] of sources) {
		const r = rel(file)
		if (isUiFile(r)) continue
		sf.forEachChild(function find(n) {
			let name, body
			if (ts.isFunctionDeclaration(n) && n.name) { name = n.name.text; body = n }
			else if (ts.isVariableStatement(n)) {
				for (const d of n.declarationList.declarations) {
					if (ts.isIdentifier(d.name) && d.initializer && (ts.isArrowFunction(d.initializer) || ts.isFunctionExpression(d.initializer))) { name = d.name.text; body = d.initializer }
				}
			}
			if (name && /^[A-Z]/.test(name) && body) componentDecls.push({ file, name, node: body })
		})
	}
	const forwards = (file, node, isGuarded) => {
		let found = false
		const visit = n => {
			if (found) return
			if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) {
				const tag = n.tagName.getText(sources.get(file))
				if (isGuarded(tag)) {
					for (const p of n.attributes.properties) {
						if (ts.isJsxSpreadAttribute(p)) { found = true; return }
						if (ts.isJsxAttribute(p) && /className$/i.test(p.name.getText()) && p.initializer && /\bclassName\b/.test(p.initializer.getText())) { found = true; return }
					}
				}
			}
			ts.forEachChild(n, visit)
		}
		visit(node)
		return found
	}
	let changed = true
	while (changed) {
		changed = false
		for (const c of componentDecls) {
			if (wrappers.has(c.name)) continue
			const fi = info.get(c.file)
			const guarded = tag => fi.uiNames.has(tag.split('.')[0]) || wrappers.has(tag)
			if (forwards(c.file, c.node, guarded)) { wrappers.set(c.name, rel(c.file)); changed = true }
		}
	}

	// wrappers that declare they take a library component's props (`ButtonProps`, `ComponentProps<typeof Button>`...)
	const propsTakers = []
	for (const c of componentDecls) {
		const sf = sources.get(c.file)
		const fn = c.node
		const params = fn.parameters || []
		const typeText = params.map(p => (p.type ? p.type.getText(sf) : '')).join(' ') + ' ' + params.map(p => p.getText(sf)).join(' ')
		const takesLibProps = /ButtonProps|ComponentProps<\s*typeof\s+(Button|Input|Textarea|Badge|Card)/.test(typeText)
		// props interfaces declared above (`interface Props extends ButtonProps`)
		const usesInterface = params.some(p => p.type && ts.isTypeReferenceNode(p.type) && new RegExp(String.raw`(interface|type)\s+` + p.type.typeName.getText(sf) + String.raw`[^{]*(ButtonProps|ComponentProps<\s*typeof\s+Button)`).test(sf.text))
		if (takesLibProps || usesInterface) propsTakers.push(c)
	}

	// ---- findings ----
	const findings = []
	const push = (f, sf, n, extra) => findings.push({ file: rel(f), line: sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1, ...extra })

	for (const [file, sf] of sources) {
		const r = rel(file)
		if (isExemptArea(r) || !file.endsWith('.tsx')) continue
		const fi = info.get(file)
		const visit = n => {
			if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === 'buttonVariants') {
				push(file, sf, n, { kind: 'buttonVariants', tag: 'buttonVariants', attr: '', tokens: ['buttonVariants()'] })
			}
			if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) {
				const tag = n.tagName.getText(sf)
				const root = tag.split('.')[0]
				const isLib = fi.uiNames.has(root)
				const isWrapper = wrappers.has(tag)
				const isNative = NATIVE.has(tag)
				const isIcon = fi.iconNames.has(root)
				if (!isIcon && !SHAPE_PARTS.has(tag)) {
					const guarded = isLib || isWrapper || isNative
					if (guarded) {
						const FORB = CONTROL_FORBIDDEN
						for (const p of n.attributes.properties) {
							if (!ts.isJsxAttribute(p) || !p.initializer) continue
							const name = p.name.getText(sf)
							if (!/className$/i.test(name)) continue
							const toks = [...new Set(strings(file, p.initializer).flatMap(s => s.split(/\s+/)).filter(Boolean))]
							const bad = toks.filter(t => FORB.some(re => re.test(core(t))))
							if (bad.length) push(file, sf, n, { kind: isNative ? 'native' : isWrapper ? 'wrapper' : 'ui', tag, attr: name, tokens: bad })
						}
					}
					// a link or anchor dressed as a button (height + shape + fill/padding) must be `<Button asChild>`
					if ((tag === 'Link' || tag === 'a') && !isLib) {
						const cattr = n.attributes.properties.find(p => ts.isJsxAttribute(p) && p.name.getText(sf) === 'className')
						if (cattr && cattr.initializer) {
							const toks = [...new Set(strings(file, cattr.initializer).flatMap(s => s.split(/\s+/)).filter(Boolean))].map(core)
							const has = re => toks.some(t => re.test(t))
							if (has(/^(min-)?h-(9|10|11|12|13)$/) && has(/^rounded(-|$)/) && (has(/^bg-/) || has(/^px-/) || has(/^border(-|$)/))) {
								push(file, sf, n, { kind: 'button-like', tag, attr: 'className', tokens: toks.filter(t => /^(min-)?h-|^rounded|^bg-|^px-|^border/.test(t)) })
							}
						}
					}
					// asChild: the child element carries the visual classes
					if ((isLib || isWrapper) && n.attributes.properties.some(p => ts.isJsxAttribute(p) && p.name.getText(sf) === 'asChild') && ts.isJsxOpeningElement(n)) {
						const parent = n.parent
						for (const child of parent.children || []) {
							if (!ts.isJsxElement(child) && !ts.isJsxSelfClosingElement(child)) continue
							const open = ts.isJsxElement(child) ? child.openingElement : child
							const cattr = open.attributes.properties.find(p => ts.isJsxAttribute(p) && p.name.getText(sf) === 'className')
							if (!cattr || !cattr.initializer) continue
							const toks = [...new Set(strings(file, cattr.initializer).flatMap(s => s.split(/\s+/)).filter(Boolean))]
							const bad = toks.filter(t => CONTROL_FORBIDDEN.some(re => re.test(core(t))))
							if (bad.length) push(file, sf, open, { kind: 'asChild', tag: `${tag} > ${open.tagName.getText(sf)}`, attr: 'className', tokens: bad })
						}
					}
				}
			}
			ts.forEachChild(n, visit)
		}
		visit(sf)
	}
	// a wrapper that takes ButtonProps must pass its rest props on (otherwise `size`/`variant` are silently ignored)
	for (const c of propsTakers) {
		const sf = sources.get(c.file)
		const fi = info.get(c.file)
		const rest = []
		for (const p of c.node.parameters || []) {
			if (ts.isObjectBindingPattern(p.name)) {
				for (const e of p.name.elements) if (e.dotDotDotToken) rest.push(e.name.getText(sf))
			} else if (ts.isIdentifier(p.name)) rest.push(p.name.getText(sf))
		}
		let spread = false
		const visit = n => {
			if (ts.isJsxSpreadAttribute(n) && rest.includes(n.expression.getText(sf).replace(/^\.\.\./, ''))) spread = true
			ts.forEachChild(n, visit)
		}
		visit(c.node)
		if (!spread) push(c.file, sf, c.node, { kind: 'drops-props', tag: c.name, attr: '', tokens: ['takes ButtonProps but does not spread them on its Button'] })
		// explicit size/variant/rounded written AFTER the spread override whatever the caller passed
		const order = n => {
			if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) {
				const tag = n.tagName.getText(sf)
				if (fi.uiNames.has(tag.split('.')[0]) || wrappers.has(tag)) {
					let seenSpread = false
					for (const a of n.attributes.properties) {
						if (ts.isJsxSpreadAttribute(a)) seenSpread = true
						else if (seenSpread && ts.isJsxAttribute(a) && ['size', 'variant', 'rounded'].includes(a.name.getText(sf)))
							push(c.file, sf, a, { kind: 'prop-after-spread', tag, attr: a.name.getText(sf), tokens: [a.name.getText(sf) + ' after {...props}'] })
					}
				}
			}
			ts.forEachChild(n, order)
		}
		order(c.node)
	}
	return { findings, wrappers: [...wrappers.entries()].map(([name, file]) => ({ name, file, takesButtonProps: propsTakers.some(c => c.name === name) })) }
}

module.exports = { scan, CONTROL_FORBIDDEN, SHAPE_PARTS, core }

if (require.main === module) {
	const { findings, wrappers } = scan()
	if (process.argv.includes('--json')) console.log(JSON.stringify({ findings, wrappers }, null, 1))
	else {
		const byKind = {}
		for (const f of findings) (byKind[f.kind] ||= []).push(f)
		for (const [k, list] of Object.entries(byKind)) {
			console.log(`\n== ${k}: ${list.length}`)
			for (const f of list) console.log(`${f.file}:${f.line} <${f.tag}> ${f.attr} ${f.tokens.slice(0, 8).join(' ')}`)
		}
		console.log(`\nwrappers (${wrappers.length}): ${wrappers.map(w => w.name).join(', ')}`)
		console.log(`total findings: ${findings.length}`)
	}
}
