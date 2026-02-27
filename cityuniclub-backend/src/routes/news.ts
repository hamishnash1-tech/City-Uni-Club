import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { authenticate, optionalAuth } from '../middleware/auth.js'

const router = Router()

// Get all active news (authenticated only)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, featured, limit } = req.query

    let query = supabase
      .from('club_news')
      .select('*')
      .eq('is_active', true)
      .order('published_date', { ascending: false })

    if (category) {
      query = query.eq('category', category as string)
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true)
    }

    if (limit) {
      query = query.limit(Number(limit))
    }

    const { data: news, error } = await query

    if (error) {
      console.error('Get news error:', error)
      res.status(500).json({ error: 'Failed to get news' })
      return
    }

    res.json({ news })
  } catch (error) {
    console.error('Get news error:', error)
    res.status(500).json({ error: 'Failed to get news' })
  }
})

// Get single news article
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params

    const { data: article, error } = await supabase
      .from('club_news')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error || !article) {
      res.status(404).json({ error: 'Article not found' })
      return
    }

    res.json({ article })
  } catch (error) {
    console.error('Get article error:', error)
    res.status(500).json({ error: 'Failed to get article' })
  }
})

// Create news article (admin only - would need additional admin middleware)
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, content, category, published_date, is_featured } = req.body

    if (!title || !content || !category) {
      res.status(400).json({ error: 'Title, content, and category are required' })
      return
    }

    const { data: article, error } = await supabase
      .from('club_news')
      .insert({
        title,
        content,
        category,
        published_date: published_date || new Date().toISOString().split('T')[0],
        is_featured: is_featured || false,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Create news error:', error)
      res.status(500).json({ error: 'Failed to create news article' })
      return
    }

    res.status(201).json({
      article,
      message: 'News article created successfully'
    })
  } catch (error) {
    console.error('Create news error:', error)
    res.status(500).json({ error: 'Failed to create news article' })
  }
})

// Update news article
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params
    const { title, content, category, published_date, is_featured, is_active } = req.body

    const updateData: Record<string, any> = { updated_at: new Date().toISOString() }
    if (title) updateData.title = title
    if (content) updateData.content = content
    if (category) updateData.category = category
    if (published_date) updateData.published_date = published_date
    if (is_featured !== undefined) updateData.is_featured = is_featured
    if (is_active !== undefined) updateData.is_active = is_active

    const { data: article, error } = await supabase
      .from('club_news')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update news error:', error)
      res.status(500).json({ error: 'Failed to update news article' })
      return
    }

    res.json({
      article,
      message: 'News article updated successfully'
    })
  } catch (error) {
    console.error('Update news error:', error)
    res.status(500).json({ error: 'Failed to update news article' })
  }
})

// Delete news article (soft delete)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params

    const { data: article, error } = await supabase
      .from('club_news')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Delete news error:', error)
      res.status(500).json({ error: 'Failed to delete news article' })
      return
    }

    res.json({
      article,
      message: 'News article deleted successfully'
    })
  } catch (error) {
    console.error('Delete news error:', error)
    res.status(500).json({ error: 'Failed to delete news article' })
  }
})

export default router
