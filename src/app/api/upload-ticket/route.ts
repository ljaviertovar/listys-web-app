import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { MAX_IMAGES_PER_TICKET } from '@/lib/config/limits'

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
    const files = formData.getAll('files') as File[]
    const groupId = formData.get('group_id') as string | null
    const storeName = formData.get('store_name') as string | null

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    if (files.length > MAX_IMAGES_PER_TICKET) {
      return NextResponse.json(
        { error: `Maximum ${MAX_IMAGES_PER_TICKET} images per ticket` },
        { status: 400 }
      )
    }

    // Validate all files
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'All files must be images' }, { status: 400 })
      }
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'Each file must be less than 10MB' }, { status: 400 })
      }
    }

    // Upload all files to storage
    const uploadedPaths: string[] = []
    const timestamp = Date.now()

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Robust extension extraction and normalization
      let ext = ''
      try {
        const name = (file.name || '').toString()
        const parts = name.split('.')
        ext = parts.length > 1 ? parts.pop()!.toLowerCase() : ''
      } catch (e) {
        ext = ''
      }

      if (!ext) {
        const mime = (file.type || '').toString()
        ext = mime.split('/').pop() || ''
      }

      // Ensure extension is safe (only letters/numbers)
      ext = (ext || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
      if (!ext) ext = 'jpg'

      // Generate deterministic, safe key: userId/timestamp_index_random.ext
      // Use short random suffix to avoid collisions
      const rand = Math.random().toString(36).slice(2, 8)
      let candidate = `${user.id}/${timestamp}_${i + 1}_${rand}.${ext}`

      // Sanitize candidate to allowed set: a-zA-Z0-9-_. and /
      candidate = candidate.replace(/[^a-zA-Z0-9-_.\\/]/g, '_')
      // Collapse multiple underscores
      candidate = candidate.replace(/_+/g, '_')
      // Prevent leading/trailing dots or underscores in segments
      candidate = candidate.split('/').map(seg => seg.replace(/^[_\.]+|[_\.]+$/g, '')).join('/')

      // Log for debugging if uploads fail (can be removed later)
      console.log('Uploading file:', { originalName: file.name, generatedKey: candidate })

      const { error: uploadError } = await supabase.storage
        .from('tickets')
        .upload(candidate, file)

      if (uploadError) {
        // Clean up already uploaded files
        if (uploadedPaths.length > 0) {
          await supabase.storage.from('tickets').remove(uploadedPaths)
        }
        console.error('Upload error for', file.name, uploadError)
        return NextResponse.json({ error: uploadError.message }, { status: 500 })
      }

      uploadedPaths.push(candidate)
    }

    // Create ticket record with both image_path (primary) and image_paths (array)
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert({
        user_id: user.id,
        group_id: groupId,
        image_path: uploadedPaths[0], // Primary image for backward compatibility
        image_paths: uploadedPaths,   // All images array
        store_name: storeName,
        ocr_status: 'pending',
      })
      .select()
      .single()

    if (ticketError) {
      // Clean up uploaded files
      await supabase.storage.from('tickets').remove(uploadedPaths)
      return NextResponse.json({ error: ticketError.message }, { status: 500 })
    }

    // Create signed URLs for all images
    const signedUrls: string[] = []
    for (const path of uploadedPaths) {
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('tickets')
        .createSignedUrl(path, 60 * 60) // 1 hour

      if (signedUrlError || !signedUrlData?.signedUrl) {
        console.error('Failed to create signed URL for:', path, signedUrlError)
        continue
      }
      signedUrls.push(signedUrlData.signedUrl)
    }

    if (signedUrls.length === 0) {
      console.error('No signed URLs could be created')
      await supabase
        .from('tickets')
        .update({ ocr_status: 'failed' })
        .eq('id', ticket.id)
      return NextResponse.json({ data: ticket })
    }

    // Trigger OCR processing via Edge Function with all images
    console.log('Calling Edge Function with', signedUrls.length, 'images')

    // Trigger OCR processing via Edge Function with all images (fire-and-forget)
    // Start the request but do not await it so frontend is not blocked waiting for OCR
    try {
      fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-ticket-ocr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          ticketId: ticket.id,
          imageUrls: signedUrls, // Array of URLs
          imageUrl: signedUrls[0], // Backward compatibility
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const text = await res.text()
            console.error('OCR function error:', text)
            try {
              await supabase.from('tickets').update({ ocr_status: 'failed' }).eq('id', ticket.id)
            } catch (u) {
              console.error('Failed to update ticket status after OCR error:', u)
            }
            return
          }
          try {
            const result = await res.json()
            console.log('OCR processing triggered successfully:', result)
          } catch (e) {
            console.log('OCR triggered but failed to parse response')
          }
        })
        .catch(async (err) => {
          console.error('Failed to trigger OCR:', err)
          try {
            await supabase.from('tickets').update({ ocr_status: 'failed' }).eq('id', ticket.id)
          } catch (u) {
            console.error('Failed to update ticket status after OCR failure:', u)
          }
        })
    } catch (err) {
      console.error('Failed to initiate OCR trigger:', err)
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
