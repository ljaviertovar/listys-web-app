import { NextResponse } from 'next/server'
import { fromUnknownError } from '@/lib/api/http'
import { uploadTicket } from '@/lib/server/services/tickets.service'

export async function POST(request: Request) {
  const requestId = crypto.randomUUID()
  try {
    const formData = await request.formData()
    const data = await uploadTicket(formData)
    return NextResponse.json(data, { status: 202 })
  } catch (error) {
    const response = fromUnknownError(error, requestId)
    const payload = (await response.json()) as { error?: { message?: string } }
    return NextResponse.json({ error: payload.error?.message ?? 'Upload failed' }, { status: response.status })
  }
}
