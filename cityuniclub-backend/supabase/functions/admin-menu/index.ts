import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req)
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  try {
    const db = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401)

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await db.auth.getUser(token)
    if (authError || !user || user.app_metadata?.role !== 'admin') return json({ error: 'Forbidden' }, 403)

    const url = new URL(req.url)
    const id = url.searchParams.get('id')

    // GET — list all items (including inactive for admin)
    if (req.method === 'GET') {
      const { data, error } = await db
        .from('menu_items')
        .select('*')
        .order('menu')
        .order('category', { nullsFirst: true })
        .order('section', { nullsFirst: true })
        .order('sort_order')
      if (error) throw error
      return json({ items: data })
    }

    // POST — create item
    if (req.method === 'POST') {
      const contentType = req.headers.get('content-type') ?? ''

      // Image upload
      if (contentType.includes('multipart/form-data')) {
        const form = await req.formData()
        const file = form.get('file') as File | null
        const itemId = form.get('item_id') as string | null
        if (!file || !itemId) return json({ error: 'file and item_id required' }, 400)

        const ext = file.name.split('.').pop()
        const path = `${itemId}.${ext}`

        const { error: uploadError } = await db.storage
          .from('menu-photos')
          .upload(path, file, { upsert: true, contentType: file.type })
        if (uploadError) throw uploadError

        const { data: urlData } = db.storage.from('menu-photos').getPublicUrl(path)

        const { error: updateError } = await db
          .from('menu_items')
          .update({ image_url: urlData.publicUrl, updated_at: new Date().toISOString() })
          .eq('id', itemId)
        if (updateError) throw updateError

        return json({ image_url: urlData.publicUrl })
      }

      // JSON create
      const body = await req.json()
      const { data, error } = await db.from('menu_items').insert([body]).select().single()
      if (error) throw error
      return json({ item: data }, 201)
    }

    // PUT — update item
    if (req.method === 'PUT') {
      if (!id) return json({ error: 'Missing id' }, 400)
      const body = await req.json()
      body.updated_at = new Date().toISOString()
      const { data, error } = await db.from('menu_items').update(body).eq('id', id).select().single()
      if (error) throw error
      return json({ item: data })
    }

    // DELETE — remove item
    if (req.method === 'DELETE') {
      if (!id) return json({ error: 'Missing id' }, 400)

      // Remove photo from storage if present
      const { data: item } = await db.from('menu_items').select('image_url').eq('id', id).single()
      if (item?.image_url) {
        const path = item.image_url.split('/menu-photos/')[1]
        if (path) await db.storage.from('menu-photos').remove([path])
      }

      const { error } = await db.from('menu_items').delete().eq('id', id)
      if (error) throw error
      return json({ success: true })
    }

    return json({ error: 'Method not allowed' }, 405)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return json({ error: message }, 400)
  }
})
