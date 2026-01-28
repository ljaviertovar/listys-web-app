import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface RequestBody {
  ticketId: string
  imageUrl: string
}

serve(async (req) => {
  try {
    const { ticketId, imageUrl }: RequestBody = await req.json()

    if (!ticketId || !imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing ticketId or imageUrl' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Update ticket status to processing
    await supabase
      .from('tickets')
      .update({ ocr_status: 'processing' })
      .eq('id', ticketId)

    // Call OpenAI Vision API
    const ocrResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Extract all items from this grocery receipt/ticket.
Return ONLY a valid JSON array with this exact structure, no markdown formatting:

[
  {
    "name": "Product name",
    "quantity": 2,
    "unit": "kg" | "pcs" | "lbs" | null,
    "price": 5.99,
    "category": "Produce" | "Dairy" | "Meat" | "Seafood" | "Bakery" | "Pantry" | "Frozen" | "Beverages" | "Snacks" | "Health & Beauty" | "Household" | "Other"
  }
]

Rules:
- Normalize item names (capitalize properly, remove extra spaces)
- Infer units if not explicitly shown
- Ignore subtotals, taxes, payment info, and totals
- Only return the JSON array, no additional text or markdown
- If you can't extract items, return an empty array []`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 2000,
      }),
    })

    if (!ocrResponse.ok) {
      const error = await ocrResponse.text()
      console.error('OpenAI API error:', error)
      throw new Error(`OpenAI API error: ${error}`)
    }

    const ocrData = await ocrResponse.json()
    const content = ocrData.choices[0]?.message?.content || '[]'

    // Parse the response
    let items: any[] = []
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim()
      items = JSON.parse(cleanContent)
    } catch (parseError) {
      console.error('Failed to parse OCR response:', content)
      throw new Error('Failed to parse OCR response')
    }

    // Insert items into database
    if (items.length > 0) {
      const itemsToInsert = items.map((item: any) => ({
        ticket_id: ticketId,
        name: item.name,
        quantity: item.quantity || 1,
        unit: item.unit || null,
        price: item.price || null,
        category: item.category || null,
      }))

      const { error: insertError } = await supabase
        .from('ticket_items')
        .insert(itemsToInsert)

      if (insertError) {
        console.error('Failed to insert items:', insertError)
        throw insertError
      }
    }

    // Update ticket status
    await supabase
      .from('tickets')
      .update({
        ocr_status: 'completed',
        processed_at: new Date().toISOString(),
        total_items: items.length,
      })
      .eq('id', ticketId)

    return new Response(
      JSON.stringify({ success: true, itemCount: items.length }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('OCR processing error:', error)

    // Try to update ticket status to failed with error details
    if (req.json) {
      try {
        const bodyText = await req.text()
        const body = JSON.parse(bodyText)
        const { ticketId } = body
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        // Store the error message
        const errorMessage = error.message || 'OCR processing failed'

        await supabase
          .from('tickets')
          .update({
            ocr_status: 'failed',
            ocr_error: errorMessage
          })
          .eq('id', ticketId)
      } catch (updateError) {
        console.error('Failed to update ticket status:', updateError)
      }
    }

    return new Response(
      JSON.stringify({ error: error.message || 'OCR processing failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
