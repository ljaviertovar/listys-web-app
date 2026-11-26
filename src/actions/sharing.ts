'use server'

import { redirect } from 'next/navigation'

import { ApiServiceError, ErrorCode } from '@/lib/api/http'
import { acceptInvite } from '@/lib/server/services/sharing.service'
import { acceptInviteSchema } from '@/lib/validations/sharing'

export type AcceptInviteState = { error: string | null }

const INVALID_INVITE = 'This invite link is invalid or has expired.'
const FAILED = 'We couldn’t add you to the list. Try again.'

/**
 * Joins the signed-in user to the list of an invite link. Bound to the invite screen only: acceptInvite authenticates the caller
 * and checks the link (active, not expired, uses left) before it adds anyone.
 */
export async function acceptInviteAction(_previous: AcceptInviteState, formData: FormData): Promise<AcceptInviteState> {
	const parsed = acceptInviteSchema.safeParse({ token: formData.get('token') })
	if (!parsed.success) return { error: INVALID_INVITE }

	let destination: string
	try {
		const result = await acceptInvite(parsed.data.token)
		destination = result.active_session_id ? `/shopping/${result.active_session_id}` : `/base-lists/${result.base_list_id}/edit`
	} catch (error) {
		// Only the service's own client errors are written for people; anything else (a database message) stays on the server.
		const isReadable = error instanceof ApiServiceError && error.code !== ErrorCode.INTERNAL_ERROR
		if (!isReadable) console.error('Accepting an invite failed:', error)
		return { error: isReadable ? error.message : FAILED }
	}

	// Outside the try: redirect works by throwing.
	redirect(destination)
}
