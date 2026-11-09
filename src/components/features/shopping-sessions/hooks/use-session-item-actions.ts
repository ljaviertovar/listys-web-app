'use client'

import type { ShoppingSessionItem } from '@/types'
import { useTripSync } from './use-trip-sync'

export function useSessionItemActions(item: ShoppingSessionItem) {
  const { controller, state } = useTripSync(item.shopping_session_id)
  const current = state.items[item.id] ?? item
  const checked = state.pending[item.id]?.checked ?? current.checked ?? false
  return {
    checked,
    toggling: !state.initialized || state.locked || state.ended || Boolean(state.conflicts[item.id]),
    toggle: () => {
      // Read at event time so two fast taps never toggle the same stale render.
      const latest = controller?.store.getState()
      const value = latest?.pending[item.id]?.checked ?? latest?.items[item.id]?.checked ?? checked
      controller?.queue(item.id, !value)
    },
  }
}
