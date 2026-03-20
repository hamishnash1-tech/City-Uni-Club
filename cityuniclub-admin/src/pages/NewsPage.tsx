import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  LinearProgress,
  InputAdornment,
  Switch,
  FormControlLabel,
  CircularProgress,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import NewReleasesIcon from '@mui/icons-material/NewReleases'
import EventIcon from '@mui/icons-material/Event'
import DiningIcon from '@mui/icons-material/Dining'
import BusinessIcon from '@mui/icons-material/Business'
import StarIcon from '@mui/icons-material/Star'
import SearchIcon from '@mui/icons-material/Search'
import { useAuth } from '../context/AuthContext'
import { FUNCTIONS_URL } from '../services/supabase'

type NewsCategory = 'Dining' | 'Special Offer' | 'Special Event' | 'Event' | 'General'

interface NewsArticle {
  id: string
  title: string
  content: string
  category: NewsCategory
  published_date: string
  is_featured: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

const CATEGORIES: NewsCategory[] = ['Dining', 'Event', 'Special Event', 'Special Offer', 'General']

const categoryColors: Record<NewsCategory, 'primary' | 'secondary' | 'success' | 'info' | 'warning'> = {
  'Dining': 'success',
  'Event': 'primary',
  'Special Event': 'secondary',
  'Special Offer': 'warning',
  'General': 'info',
}

const categoryIcons: Record<NewsCategory, any> = {
  'Dining': <DiningIcon fontSize="small" />,
  'Event': <EventIcon fontSize="small" />,
  'Special Event': <StarIcon fontSize="small" />,
  'Special Offer': <BusinessIcon fontSize="small" />,
  'General': <NewReleasesIcon fontSize="small" />,
}

export default function NewsPage() {
  const { sessionToken } = useAuth()
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [openDialog, setOpenDialog] = useState(false)
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    published_date: new Date().toISOString().split('T')[0],
    category: 'General' as NewsCategory,
    content: '',
    is_featured: false,
    is_active: true,
  })

  const authHeaders = {
    'Authorization': `Bearer ${sessionToken}`,
    'Content-Type': 'application/json',
  }

  const fetchNews = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${FUNCTIONS_URL}/admin-news`, { headers: authHeaders })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load news')
      setArticles(data.news ?? [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchNews() }, [])

  const filteredArticles = useMemo(() => {
    let filtered = articles
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(term) ||
        a.content.toLowerCase().includes(term)
      )
    }
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(a => a.category === categoryFilter)
    }
    return filtered
  }, [articles, searchTerm, categoryFilter])

  const stats = useMemo(() => ({
    total: articles.length,
    active: articles.filter(a => a.is_active).length,
    featured: articles.filter(a => a.is_featured).length,
  }), [articles])

  const handleOpenDialog = (article?: NewsArticle) => {
    if (article) {
      setEditingArticle(article)
      setFormData({
        title: article.title,
        published_date: article.published_date,
        category: article.category,
        content: article.content,
        is_featured: article.is_featured,
        is_active: article.is_active,
      })
    } else {
      setEditingArticle(null)
      setFormData({
        title: '',
        published_date: new Date().toISOString().split('T')[0],
        category: 'General',
        content: '',
        is_featured: false,
        is_active: true,
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingArticle(null)
  }

  const handleSubmit = async () => {
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      if (editingArticle) {
        const res = await fetch(`${FUNCTIONS_URL}/admin-news?id=${editingArticle.id}`, {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify(formData),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to update article')
        setArticles(articles.map(a => a.id === editingArticle.id ? data.article : a))
        setSuccess('Article updated')
      } else {
        const res = await fetch(`${FUNCTIONS_URL}/admin-news`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify(formData),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to create article')
        setArticles([data.article, ...articles])
        setSuccess('Article created')
      }
      handleCloseDialog()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this article?')) return
    try {
      const res = await fetch(`${FUNCTIONS_URL}/admin-news?id=${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete')
      }
      setArticles(articles.filter(a => a.id !== id))
      setSuccess('Article deleted')
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleToggleActive = async (article: NewsArticle) => {
    try {
      const res = await fetch(`${FUNCTIONS_URL}/admin-news?id=${article.id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ is_active: !article.is_active }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update')
      setArticles(articles.map(a => a.id === article.id ? data.article : a))
    } catch (err: any) {
      setError(err.message)
    }
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>Club News</Typography>
          <Typography variant="body2" color="textSecondary">Latest updates from City University Club</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          New Article
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Articles', value: stats.total, icon: <NewReleasesIcon color="action" /> },
          { label: 'Active', value: stats.active, icon: <EventIcon color="success" /> },
          { label: 'Featured', value: stats.featured, icon: <StarIcon color="warning" /> },
        ].map(({ label, value, icon }) => (
          <Grid size={{ xs: 12, sm: 4 }} key={label}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {icon}
                  <Box>
                    <Typography variant="body2" color="textSecondary">{label}</Typography>
                    <Typography variant="h4">{value}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Search"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select value={categoryFilter} label="Category" onChange={(e) => setCategoryFilter(e.target.value)}>
                <MenuItem value="all">All Categories</MenuItem>
                {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredArticles.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <NewReleasesIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary">No articles found</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ mt: 2 }}>
            New Article
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredArticles.map((article) => (
            <Grid size={{ xs: 12, md: 6 }} key={article.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', opacity: article.is_active ? 1 : 0.6 }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      <Chip
                        icon={categoryIcons[article.category]}
                        label={article.category}
                        size="small"
                        color={categoryColors[article.category]}
                      />
                      {article.is_featured && <Chip icon={<StarIcon />} label="Featured" size="small" color="warning" variant="outlined" />}
                      {!article.is_active && <Chip label="Hidden" size="small" color="default" />}
                    </Box>
                    <Box>
                      <IconButton size="small" onClick={() => handleOpenDialog(article)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => handleDelete(article.id)} color="error"><DeleteIcon fontSize="small" /></IconButton>
                    </Box>
                  </Box>

                  <Typography variant="h6" gutterBottom>{article.title}</Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>{formatDate(article.published_date)}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {article.content.length > 200 ? `${article.content.substring(0, 200)}...` : article.content}
                  </Typography>
                </CardContent>

                <CardActions>
                  <Button size="small" onClick={() => handleOpenDialog(article)}>Edit</Button>
                  <Button size="small" color={article.is_active ? 'warning' : 'success'} onClick={() => handleToggleActive(article)}>
                    {article.is_active ? 'Hide' : 'Show'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingArticle ? 'Edit Article' : 'New Article'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Published Date"
                  type="date"
                  value={formData.published_date}
                  onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    label="Category"
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as NewsCategory })}
                  >
                    {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              multiline
              rows={6}
              required
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControlLabel
                control={<Switch checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} />}
                label="Featured"
              />
              <FormControlLabel
                control={<Switch checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />}
                label="Active (visible on website)"
              />
            </Box>

            {saving && <LinearProgress />}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.title || !formData.content || saving}
          >
            {editingArticle ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
