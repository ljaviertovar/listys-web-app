'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { StatusCard, SyncStatusLine } from '@/components/commons'
import type { SessionItemDto } from '@/lib/validations/shopping-session-item'
import { useTripSync } from './hooks/use-trip-sync'

export function TripSyncStatus({ sessionId, items, active }: { sessionId: string; items: SessionItemDto[]; active: boolean }) {
  const { controller, state } = useTripSync(sessionId)
  useEffect(() => { controller?.receive(items, active) }, [controller, items, active])
  const conflicts = Object.entries(state.conflicts)
  const dirty = Object.keys(state.pending).length > 0
  const message = !state.initialized ? 'Loading saved changes…' : state.error ? 'Not saved' : dirty || state.busy ? 'Saving…' : 'Saved'
  if (!active && !dirty && !conflicts.length && !state.error) return null
  return <div data-testid='trip-sync-status' className='flex flex-col gap-2'>
    <SyncStatusLine
      message={state.ended ? 'This trip has ended' : conflicts.length ? 'Changes need your attention' : message}
      icon={state.ended || conflicts.length ? undefined : message === 'Saved' ? 'saved' : message === 'Saving…' ? 'saving' : undefined}
      onRetry={state.error && !state.ended ? () => { void controller?.retry().catch(() => {}) } : undefined}
    />
    {state.error ? <p className='text-xs text-muted-foreground'>{state.error}</p> : null}
    {state.storageError ? <p role='status' className='text-xs text-muted-foreground'>Pending changes cannot be recovered after a reload on this device.</p> : null}
    {conflicts.map(([id, conflict]) => <StatusCard key={id} testId={`trip-item-conflict-${id}`} tone='info'
      title={conflict.reason === 'changed' ? `${state.items[id]?.name ?? 'This item'} changed on another device` : 'A pending change could not be applied'}
      description={conflict.reason === 'changed' ? `This device wanted to ${conflict.intention.checked ? 'check' : 'uncheck'} this item. The current saved value is shown.` : 'The trip ended or this item is no longer available. Your change was not applied.'}
      actions={<>
        {conflict.reason === 'changed' && !state.ended ? <Button variant='secondary' size='lg' onClick={() => controller?.resolve(id, true)}>Apply My Change</Button> : null}
        <Button variant='link' size='lg' onClick={() => controller?.resolve(id, false)}>Discard My Change</Button>
      </>} />)}
  </div>
}
