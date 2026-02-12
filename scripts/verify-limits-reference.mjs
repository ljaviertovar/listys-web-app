import { readFileSync } from 'node:fs'

const LIMITS_FILE = 'src/lib/config/limits.ts'
const REFERENCE_FILE = 'docs/reference/limits.md'

const limitsContent = readFileSync(LIMITS_FILE, 'utf8')
const referenceContent = readFileSync(REFERENCE_FILE, 'utf8')

const constantsInCode = new Map()
for (const match of limitsContent.matchAll(/export const\s+([A-Z0-9_]+)\s*=\s*(\d+)/g)) {
	constantsInCode.set(match[1], Number(match[2]))
}

if (constantsInCode.size === 0) {
	console.error(`No constants found in ${LIMITS_FILE}`)
	process.exit(1)
}

const constantsInDocs = new Map()
for (const line of referenceContent.split('\n')) {
	const rowMatch = line.match(/^\|\s*`([A-Z0-9_]+)`\s*\|\s*(\d+)\s*\|/)
	if (!rowMatch) continue
	constantsInDocs.set(rowMatch[1], Number(rowMatch[2]))
}

if (constantsInDocs.size === 0) {
	console.error(`No constants found in ${REFERENCE_FILE}`)
	process.exit(1)
}

const mismatches = []

for (const [name, value] of constantsInCode) {
	if (!constantsInDocs.has(name)) {
		mismatches.push(`Missing constant in docs: ${name}`)
		continue
	}

	const documentedValue = constantsInDocs.get(name)
	if (documentedValue !== value) {
		mismatches.push(`Value mismatch for ${name}: code=${value}, docs=${documentedValue}`)
	}
}

for (const name of constantsInDocs.keys()) {
	if (!constantsInCode.has(name)) {
		mismatches.push(`Extra constant in docs not found in code: ${name}`)
	}
}

if (mismatches.length > 0) {
	console.error('Limits reference verification failed:')
	for (const mismatch of mismatches) {
		console.error(`- ${mismatch}`)
	}
	process.exit(1)
}

console.log('Limits reference is in sync with src/lib/config/limits.ts')
