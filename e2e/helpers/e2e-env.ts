/**
 * The one place E2E code reads its Supabase target. It accepts only the `E2E_*` inputs (never the ordinary application
 * credentials) and only loopback destinations, so a test can neither reach the hosted project by accident nor fall back to it.
 * Errors name the field and never print a value.
 */

/** Literal loopback hosts. A hostname that merely starts with one of these (`localhost.example.com`) is not one of them. */
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])

const REQUIRED_KEYS = ['E2E_SUPABASE_URL', 'E2E_SUPABASE_PUBLISHABLE_KEY', 'E2E_SUPABASE_SERVICE_ROLE_KEY'] as const

const DEFAULT_APP_URL = 'http://localhost:3000'

export interface E2EEnv {
	supabaseUrl: string
	publishableKey: string
	serviceRoleKey: string
	/** Origin of the application under test; also loopback. */
	appUrl: string
}

export class E2EEnvError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'E2EEnvError'
	}
}

/** Origin of a loopback URL with an explicit port, or an error that names `field` only. */
function loopbackOrigin(field: string, raw: string): string {
	let url: URL
	try {
		url = new URL(raw)
	} catch {
		throw new E2EEnvError(`${field} is not a valid URL.`)
	}

	if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new E2EEnvError(`${field} must use http or https.`)
	if (url.username || url.password) throw new E2EEnvError(`${field} must not carry credentials.`)
	if (!LOOPBACK_HOSTS.has(url.hostname)) throw new E2EEnvError(`${field} must point to a loopback host (localhost, 127.0.0.1 or [::1]).`)

	const port = Number(url.port)
	if (!url.port || !Number.isInteger(port) || port < 1024 || port > 65535) {
		throw new E2EEnvError(`${field} must name an explicit port between 1024 and 65535.`)
	}
	if ((url.pathname !== '/' && url.pathname !== '') || url.search || url.hash) {
		throw new E2EEnvError(`${field} must be an origin without a path, query or fragment.`)
	}
	return url.origin
}

/**
 * Reads and validates the E2E environment. Nothing is returned unless every required input is present and every destination
 * is loopback; `NEXT_PUBLIC_SUPABASE_*` and the rest of the application's credentials are never consulted.
 */
export function loadE2EEnv(env: Record<string, string | undefined> = process.env): E2EEnv {
	const missing = REQUIRED_KEYS.filter(key => !env[key])
	if (missing.length > 0) {
		throw new E2EEnvError(`Missing required E2E inputs: ${missing.join(', ')}. Point them at a local Supabase; no fallback to application credentials exists.`)
	}

	return {
		supabaseUrl: loopbackOrigin('E2E_SUPABASE_URL', env.E2E_SUPABASE_URL as string),
		publishableKey: env.E2E_SUPABASE_PUBLISHABLE_KEY as string,
		serviceRoleKey: env.E2E_SUPABASE_SERVICE_ROLE_KEY as string,
		appUrl: loopbackOrigin('E2E_APP_URL', env.E2E_APP_URL || DEFAULT_APP_URL),
	}
}
