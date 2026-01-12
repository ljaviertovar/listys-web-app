import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const groupId = formData.get('group_id') as string | null
    const storeName = formData.get('store_name') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
    }

    // Upload to storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('tickets')
      .upload(fileName, file)

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Create ticket record
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert({
        user_id: user.id,
        group_id: groupId,
        image_path: fileName,
        store_name: storeName,
        ocr_status: 'pending',
      })
      .select()
      .single()

    if (ticketError) {
      // Clean up uploaded file
      await supabase.storage.from('tickets').remove([fileName])
      return NextResponse.json({ error: ticketError.message }, { status: 500 })
    }

    // Trigger OCR processing via Edge Function
    const { data: publicUrlData } = supabase.storage
      .from('tickets')
      .getPublicUrl(fileName)

    try {
      const ocrResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-ticket-ocr`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            ticketId: ticket.id,
            imageUrl: publicUrlData.publicUrl,
          }),
        }
      )

      if (!ocrResponse.ok) {
        console.error('OCR processing failed:', await ocrResponse.text())
      }
    } catch (error) {
      console.error('Failed to trigger OCR:', error)
    }

    return NextResponse.json({ data: ticket })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    )
  }
}
