import { createClient } from '@/lib/supabase/client'

export const BROADCAST_EVENT = 'list_activity'

export interface ActivityPayload {
  actor: string
}

/**
 * Sends a broadcast on the given channel with the current user's display name.
 * Fire-and-forget — subscribes, sends once SUBSCRIBED, then removes the channel.
 * By default Supabase Broadcast does NOT loop back to the sender, so the actor
 * won't receive their own notification.
 */
export function broadcastListActivity(channelName: string): void {
  const supabase = createClient()

  supabase.auth.getUser().then(({ data: { user } }) => {
    const actor =
      user?.user_metadata?.name ||
      user?.user_metadata?.full_name ||
      user?.email?.split('@')[0] ||
      'Someone'

    const channel = supabase.channel(channelName)
    channel.subscribe(status => {
      if (status === 'SUBSCRIBED') {
        channel
          .send({ type: 'broadcast', event: BROADCAST_EVENT, payload: { actor } })
          .finally(() => supabase.removeChannel(channel))
      }
    })
  })
}
