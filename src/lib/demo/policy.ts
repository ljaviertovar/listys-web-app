import { User } from '@supabase/supabase-js'

import { ApiServiceError, ErrorCode } from '@/lib/api/http'
import { isDemoUser } from '@/lib/demo/config'
import { assertRateLimit } from '@/lib/demo/rate-limit'

export type DemoAction =
  | 'create-group'
  | 'update-group'
  | 'delete-group'
  | 'create-base-list'
  | 'update-base-list'
  | 'delete-base-list'
  | 'create-base-list-item'
  | 'update-base-list-item'
  | 'delete-base-list-item'
  | 'upload-ticket'
  | 'merge-ticket-items'
  | 'create-base-list-from-ticket'
  | 'delete-ticket'
  | 'update-ticket'
  | 'retry-ticket-ocr'
  | 'create-shopping-session'
  | 'update-shopping-session'
  | 'complete-shopping-session'
  | 'create-shopping-session-item'
  | 'update-shopping-session-item'
  | 'delete-shopping-session-item'
  | 'cancel-shopping-session'

const DEMO_ALLOWED_MUTATIONS = new Set<DemoAction>([
  'update-base-list-item',
  'update-shopping-session-item',
])

const DEMO_RESTRICTION_MESSAGES: Record<DemoAction, string> = {
  'create-group': 'Demo account restriction: group creation is disabled in the shared demo environment.',
  'update-group': 'Demo account restriction: editing groups is disabled in the shared demo environment.',
  'delete-group': 'Demo account restriction: deleting groups is disabled in the shared demo environment.',
  'create-base-list': 'Demo account restriction: creating lists is disabled in the shared demo environment.',
  'update-base-list': 'Demo account restriction: editing list metadata is disabled in the shared demo environment.',
  'delete-base-list': 'Demo account restriction: deleting lists is disabled in the shared demo environment.',
  'create-base-list-item': 'Demo account restriction: adding new list items is disabled in the shared demo environment.',
  'update-base-list-item': 'Demo account restriction: this action is temporarily unavailable for the shared demo environment.',
  'delete-base-list-item': 'Demo account restriction: deleting list items is disabled in the shared demo environment.',
  'upload-ticket': 'Demo account restriction: receipt uploads and OCR are disabled in the shared demo environment.',
  'merge-ticket-items': 'Demo account restriction: merging receipt items into lists is disabled in the shared demo environment.',
  'create-base-list-from-ticket': 'Demo account restriction: creating a list from a receipt is disabled in the shared demo environment.',
  'delete-ticket': 'Demo account restriction: deleting receipts is disabled in the shared demo environment.',
  'update-ticket': 'Demo account restriction: editing receipt metadata is disabled in the shared demo environment.',
  'retry-ticket-ocr': 'Demo account restriction: OCR retries are disabled in the shared demo environment.',
  'create-shopping-session': 'Demo account restriction: starting new shopping sessions is disabled in the shared demo environment.',
  'update-shopping-session': 'Demo account restriction: editing shopping session metadata is disabled in the shared demo environment.',
  'complete-shopping-session': 'Demo account restriction: completing the demo shopping session is disabled to preserve the shared experience.',
  'create-shopping-session-item': 'Demo account restriction: adding shopping session items is disabled in the shared demo environment.',
  'update-shopping-session-item': 'Demo account restriction: this action is temporarily unavailable for the shared demo environment.',
  'delete-shopping-session-item': 'Demo account restriction: deleting shopping session items is disabled in the shared demo environment.',
  'cancel-shopping-session': 'Demo account restriction: cancelling the demo shopping session is disabled to preserve the shared experience.',
}

export function assertDemoActionAllowed(user: Pick<User, 'id' | 'email'>, action: DemoAction) {
  if (!isDemoUser(user)) return

  if (!DEMO_ALLOWED_MUTATIONS.has(action)) {
    throw new ApiServiceError(403, ErrorCode.FORBIDDEN, DEMO_RESTRICTION_MESSAGES[action])
  }

  assertRateLimit(`demo-user:${user.id}:${action}`, {
    max: 30,
    windowMs: 60_000,
    message: 'Demo account restriction: too many changes in a short period. Please wait a moment and try again.',
    details: { action },
  })
}
