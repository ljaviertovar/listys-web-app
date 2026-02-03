import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_: Request, { params }: { params: unknown }) {
  try {
    // `params` may be a Promise in Next.js app routes. Resolve safely.
    const resolvedParams: any = (params && typeof (params as any).then === 'function') ? await params : params
    const { ticketId } = resolvedParams || {}
    if (!ticketId) return NextResponse.json({ error: 'Missing ticketId' }, { status: 400 })

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: ticket, error } = await supabase
      .from('tickets')
      .select('id, ocr_status')
      .eq('id', ticketId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ocr_status: ticket?.ocr_status ?? null })
  } catch (e: any) {
    console.error('Status API error', e)
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 })
  }
}
