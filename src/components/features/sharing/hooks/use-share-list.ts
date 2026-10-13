'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'

import type { CollaboratorWithProfile, InviteLinkWithUrl } from '@/types'

interface Options {
	baseListId: string
	isOwner: boolean
	initialCollaborators?: CollaboratorWithProfile[]
	initialInviteLinks?: InviteLinkWithUrl[]
}

/**
 * The data of a share sheet and what can be done with it: who has access, the invite link, and creating, regenerating or
 * revoking that link and removing a person. The sheet loads it each time it opens, so it never shows a stale list.
 */
export function useShareList({ baseListId, isOwner, initialCollaborators = [], initialInviteLinks = [] }: Options) {
	const [collaborators, setCollaborators] = useState<CollaboratorWithProfile[]>(initialCollaborators)
	const [inviteLinks, setInviteLinks] = useState<InviteLinkWithUrl[]>(initialInviteLinks)
	const [isLoading, startTransition] = useTransition()
	const [isGenerating, setIsGenerating] = useState(false)

	const load = () => {
		startTransition(async () => {
			const [collabRes, linksRes] = await Promise.all([
				fetch(`/api/v1/base-lists/${baseListId}/collaborators`),
				isOwner ? fetch(`/api/v1/base-lists/${baseListId}/invites`) : Promise.resolve(null),
			])

			if (collabRes.ok) {
				const { data } = await collabRes.json()
				setCollaborators(data ?? [])
			}

			if (linksRes?.ok) {
				const { data } = await linksRes.json()
				setInviteLinks(data ?? [])
			}
		})
	}

	const generateLink = async () => {
		setIsGenerating(true)
		try {
			const res = await fetch(`/api/v1/base-lists/${baseListId}/invites`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({}),
			})

			if (!res.ok) {
				toast.error('Failed to generate link')
				return
			}

			const { data } = await res.json()
			setInviteLinks([data]) // replace all — only one active link at a time
		} finally {
			setIsGenerating(false)
		}
	}

	const revokeLink = async (inviteId: string) => {
		const res = await fetch(`/api/v1/base-lists/${baseListId}/invites/${inviteId}`, { method: 'DELETE' })

		if (!res.ok) {
			toast.error('Failed to revoke link')
			return false
		}

		setInviteLinks(prev => prev.filter(link => link.id !== inviteId))
		return true
	}

	const removeCollaborator = async (userId: string) => {
		const res = await fetch(`/api/v1/base-lists/${baseListId}/collaborators/${userId}`, { method: 'DELETE' })

		if (!res.ok) {
			toast.error('Failed to remove collaborator')
			return false
		}

		setCollaborators(prev => prev.filter(collaborator => collaborator.user_id !== userId))
		return true
	}

	return { collaborators, inviteLinks, isLoading, isGenerating, load, generateLink, revokeLink, removeCollaborator }
}
