// v3 - insert DB record first to get UUID, use UUID as storage key
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const db = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await db.auth.getUser(token)
    if (authError || !user || user.user_metadata?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const url = new URL(req.url)
    const id = url.searchParams.get('id')

    if (req.method === 'POST') {
      const formData = await req.formData()
      const file = formData.get('file') as File | null
      const eventId = formData.get('event_id') as string
      const type = formData.get('type') as string
      const fileName = formData.get('file_name') as string

      if (!file || !eventId) {
        return new Response(JSON.stringify({ error: 'Missing file or event_id' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      // Insert DB record first to get the UUID, then use it as the storage key
      const ext = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : 'bin'
      const { data: asset, error: insertError } = await db
        .from('event_assets')
        .insert([{
          event_id: eventId,
          type: type || 'Details',
          file_url: '', // placeholder, updated below
          file_name: fileName || file.name,
          mime_type: file.type || null,
        }])
        .select()
        .single()

      if (insertError) throw insertError

      const storagePath = `event/${eventId}/${asset.id}.${ext}`

      const { error: uploadError } = await db.storage
        .from('event-pdfs')
        .upload(storagePath, file, { upsert: false, contentType: file.type })

      if (uploadError) {
        await db.from('event_assets').delete().eq('id', asset.id)
        throw uploadError
      }

      const { data: { publicUrl } } = db.storage
        .from('event-pdfs')
        .getPublicUrl(storagePath)

      const { data: updated, error: updateError } = await db
        .from('event_assets')
        .update({ file_url: publicUrl })
        .eq('id', asset.id)
        .select()
        .single()

      if (updateError) throw updateError

      return new Response(JSON.stringify({ asset: updated }), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (req.method === 'PATCH') {
      if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      const body = await req.json()
      const { data: asset, error } = await db.from('event_assets').update({ file_name: body.file_name }).eq('id', id).select().single()
      if (error) throw error
      return new Response(JSON.stringify({ asset }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (req.method === 'DELETE') {
      if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

      const { data: asset } = await db.from('event_assets').select('file_url, event_id').eq('id', id).single()

      const { error } = await db.from('event_assets').delete().eq('id', id)
      if (error) throw error

      // Also remove from storage if we can derive the path
      if (asset?.file_url) {
        const match = asset.file_url.match(/event-pdfs\/(.+)$/)
        if (match) await db.storage.from('event-pdfs').remove([match[1]])
      }

      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
