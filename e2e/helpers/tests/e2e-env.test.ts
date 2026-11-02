import { describe, expect, it } from 'vitest'

import { E2EEnvError, loadE2EEnv } from '../e2e-env'

const SECRET = 'SECRET-DO-NOT-PRINT'

const valid = {
	E2E_SUPABASE_URL: 'http://127.0.0.1:54321',
	E2E_SUPABASE_PUBLISHABLE_KEY: `pub-${SECRET}`,
	E2E_SUPABASE_SERVICE_ROLE_KEY: `svc-${SECRET}`,
}

const messageOf = (env: Record<string, string | undefined>) => {
	try {
		loadE2EEnv(env)
	} catch (error) {
		expect(error).toBeInstanceOf(E2EEnvError)
		return (error as Error).message
	}
	throw new Error('expected loadE2EEnv to throw')
}

describe('loadE2EEnv', () => {
	it('accepts the documented loopback configuration and defaults the application to localhost:3000', () => {
		expect(loadE2EEnv(valid)).toEqual({
			supabaseUrl: 'http://127.0.0.1:54321',
			publishableKey: valid.E2E_SUPABASE_PUBLISHABLE_KEY,
			serviceRoleKey: valid.E2E_SUPABASE_SERVICE_ROLE_KEY,
			appUrl: 'http://localhost:3000',
		})
		expect(loadE2EEnv({ ...valid, E2E_SUPABASE_URL: 'http://localhost:54321', E2E_APP_URL: 'http://[::1]:3100' })).toMatchObject({
			supabaseUrl: 'http://localhost:54321',
			appUrl: 'http://[::1]:3100',
		})
	})

	it('names every missing input and never falls back to the application credentials', () => {
		const message = messageOf({
			NEXT_PUBLIC_SUPABASE_URL: 'https://project.supabase.co',
			NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'app-key',
			SUPABASE_SERVICE_ROLE_KEY: 'app-service-key',
		})

		expect(message).toContain('E2E_SUPABASE_URL')
		expect(message).toContain('E2E_SUPABASE_PUBLISHABLE_KEY')
		expect(message).toContain('E2E_SUPABASE_SERVICE_ROLE_KEY')
		expect(message).not.toContain('app-key')
	})

	it.each([
		['a remote host', 'https://project.supabase.co:443'],
		['a hostname that starts like loopback', 'http://localhost.example.com:54321'],
		['a lookalike with the loopback address in it', 'http://127.0.0.1.nip.io:54321'],
		['an IPv4 address that is not loopback', 'http://10.0.0.5:54321'],
		['embedded credentials', 'http://user:pass@127.0.0.1:54321'],
		['no explicit port', 'http://127.0.0.1'],
		['a privileged port', 'http://127.0.0.1:80'],
		['an unexpected path', 'http://127.0.0.1:54321/rest/v1'],
		['a query string', 'http://127.0.0.1:54321/?x=1'],
		['a non-http protocol', 'ftp://127.0.0.1:54321'],
		['something that is not a URL', 'not a url'],
	])('rejects %s without printing it or the keys', (_label, url) => {
		const message = messageOf({ ...valid, E2E_SUPABASE_URL: url })

		expect(message).toContain('E2E_SUPABASE_URL')
		expect(message).not.toContain(SECRET)
		expect(message).not.toContain(url.replace(/^.*:\/\//, '').split(/[/:]/)[0] || '\u0000')
	})

	it('applies the same boundary to the application origin', () => {
		expect(messageOf({ ...valid, E2E_APP_URL: 'https://app.example.com:3000' })).toContain('E2E_APP_URL')
	})
})
