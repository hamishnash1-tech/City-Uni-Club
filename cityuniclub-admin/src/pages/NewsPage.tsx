import { useState, useMemo, type ChangeEvent } from 'react'
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
  InputAdornment
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import NewReleasesIcon from '@mui/icons-material/NewReleases'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import EventIcon from '@mui/icons-material/Event'
import DiningIcon from '@mui/icons-material/Dining'
import BusinessIcon from '@mui/icons-material/Business'

interface NewsArticle {
  id: string
  title: string
  date: string
  category: 'Dining' | 'Event' | 'Club News' | 'Special Offer'
  content: string
  image_url?: string
  pdf_url?: string
  pdf_name?: string
  author?: string
  created_at: string
}

// Mock news articles matching iOS/Android apps and website
const initialNews: NewsArticle[] = [
  {
    id: 'n1',
    title: 'Free Gin Friday - every Friday at lunch',
    date: '2025-03-07',
    category: 'Special Offer',
    content: 'Enjoy complimentary gin and tonic every Friday during lunch service. Choose from our selection of premium gins including Bombay Sapphire, Tanqueray, and our house gin. Available from 12:00 to 14:30 in the dining room.',
    author: 'Club Secretary',
    created_at: '2025-03-01'
  },
  {
    id: 'n2',
    title: 'Dining Room open 23 February for Dinner',
    date: '2025-02-20',
    category: 'Dining',
    content: 'We are pleased to announce that the dining room will be open for dinner service starting 23 February. Our new winter menu features seasonal favourites including roast rump of lamb, pan fried delice of salmon, and homemade sticky toffee pudding. Reservations recommended.',
    author: 'Club Secretary',
    created_at: '2025-02-15'
  },
  {
    id: 'n3',
    title: 'Sri Lankan Lunch - 25 February',
    date: '2025-02-18',
    category: 'Event',
    content: 'Join us for a special Sri Lankan lunch menu on 25 February. Experience the flavours of Sri Lanka with dishes including chicken curry, hoppers, kottu roti, and traditional desserts. £35 per person. Book your table now.',
    author: 'Club Secretary',
    created_at: '2025-02-10',
    pdf_name: 'sri_lankan_menu.pdf'
  },
  {
    id: 'n4',
    title: 'Wine Tasting Evening - 8 March',
    date: '2025-03-01',
    category: 'Event',
    content: 'Join our sommelier for an exclusive wine tasting featuring wines from the Loire Valley. Taste 6 exceptional wines paired with artisan cheeses. £45 per member, £55 per guest. Limited to 20 places.',
    author: 'Wine Committee',
    created_at: '2025-02-25',
    pdf_name: 'wine_tasting_menu.pdf'
  },
  {
    id: 'n5',
    title: 'Easter Sunday Roast',
    date: '2025-04-10',
    category: 'Dining',
    content: 'Book now for our special Easter Sunday Roast on 20 April. Traditional roast beef with all the trimmings, followed by chocolate Easter egg dessert. £42 per person. Children under 12 half price.',
    author: 'Club Secretary',
    created_at: '2025-03-05'
  }
]

const categoryColors: Record<string, 'primary' | 'secondary' | 'success' | 'info' | 'warning'> = {
  'Dining': 'success',
  'Event': 'primary',
  'Club News': 'info',
  'Special Offer': 'warning'
}

const categoryIcons: Record<string, any> = {
  'Dining': <DiningIcon fontSize="small" />,
  'Event': <EventIcon fontSize="small" />,
  'Club News': <NewReleasesIcon fontSize="small" />,
  'Special Offer': <BusinessIcon fontSize="small" />
}

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>(initialNews)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [openDialog, setOpenDialog] = useState(false)
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Club News' as NewsArticle['category'],
    content: '',
    author: ''
  })

  // Filter articles
  const filteredArticles = useMemo(() => {
    let filtered = articles
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(term) ||
        a.content.toLowerCase().includes(term)
      )
    }
    
    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(a => a.category === categoryFilter)
    }
    
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [articles, searchTerm, categoryFilter])

  // Stats
  const stats = useMemo(() => {
    const total = articles.length
    const dining = articles.filter(a => a.category === 'Dining').length
    const events = articles.filter(a => a.category === 'Event').length
    const offers = articles.filter(a => a.category === 'Special Offer').length
    
    return { total, dining, events, offers }
  }, [articles])

  const handleOpenDialog = (article?: NewsArticle) => {
    if (article) {
      setEditingArticle(article)
      setFormData({
        title: article.title,
        date: article.date,
        category: article.category,
        content: article.content,
        author: article.author || ''
      })
      setPdfFile(null)
    } else {
      setEditingArticle(null)
      setFormData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        category: 'Club News',
        content: '',
        author: 'Club Secretary'
      })
      setPdfFile(null)
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingArticle(null)
    setPdfFile(null)
  }

  const handlePdfChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type === 'application/pdf') {
        setPdfFile(file)
      } else {
        setError('Please select a PDF file')
      }
    }
  }

  const handleSubmit = async () => {
    setError('')
    setSuccess('')
    setUploading(true)

    try {
      let pdfUrl = editingArticle?.pdf_url
      let pdfName = editingArticle?.pdf_name

      // Upload PDF if provided (mock upload - replace with actual Supabase storage)
      if (pdfFile) {
        // In production, upload to Supabase Storage:
        // const { data, error } = await supabase.storage
        //   .from('news-pdfs')
        //   .upload(`news/${Date.now()}_${pdfFile.name}`, pdfFile)
        
        // Mock upload for demo
        await new Promise(resolve => setTimeout(resolve, 1000))
        pdfUrl = `/news-pdfs/${pdfFile.name}`
        pdfName = pdfFile.name
      }

      const articleData: NewsArticle = {
        id: editingArticle?.id || `n${Date.now()}`,
        title: formData.title,
        date: formData.date,
        category: formData.category,
        content: formData.content,
        author: formData.author || 'Club Secretary',
        pdf_url: pdfUrl,
        pdf_name: pdfName,
        created_at: editingArticle?.created_at || new Date().toISOString()
      }

      if (editingArticle) {
        setArticles(articles.map(a => a.id === editingArticle.id ? articleData : a))
        setSuccess('Article updated successfully')
      } else {
        setArticles([articleData, ...articles])
        setSuccess('Article created successfully')
      }

      handleCloseDialog()
    } catch (err: any) {
      console.error('Error saving article:', err)
      setError(err.message || 'Failed to save article')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return
    setArticles(articles.filter(a => a.id !== id))
    setSuccess('Article deleted')
  }

  const handleDownloadPdf = (article: NewsArticle) => {
    if (article.pdf_url) {
      // In production, download from Supabase Storage
      // window.open(article.pdf_url, '_blank')
      alert(`Downloading ${article.pdf_name}... (mock download)`)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Club News
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Latest updates from City University Club
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          New Article
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NewReleasesIcon color="action" />
                <Box>
                  <Typography variant="body2" color="textSecondary">Total Articles</Typography>
                  <Typography variant="h4">{stats.total}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label="🍽️" size="small" />
                <Box>
                  <Typography variant="body2" color="textSecondary">Dining</Typography>
                  <Typography variant="h4">{stats.dining}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label="📅" size="small" />
                <Box>
                  <Typography variant="body2" color="textSecondary">Events</Typography>
                  <Typography variant="h4">{stats.events}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label="🎁" size="small" />
                <Box>
                  <Typography variant="body2" color="textSecondary">Offers</Typography>
                  <Typography variant="h4">{stats.offers}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <NewReleasesIcon />
                  </InputAdornment>
                ),
              }}
              label="Search"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="Dining">Dining</MenuItem>
                <MenuItem value="Event">Events</MenuItem>
                <MenuItem value="Club News">Club News</MenuItem>
                <MenuItem value="Special Offer">Special Offers</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* News Articles Grid */}
      {filteredArticles.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <NewReleasesIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            No news articles found
          </Typography>
          <Typography color="textSecondary" sx={{ mb: 2 }}>
            Create your first article to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            New Article
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredArticles.map((article) => (
            <Grid size={{ xs: 12, md: 6 }} key={article.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Chip
                      icon={categoryIcons[article.category]}
                      label={article.category}
                      size="small"
                      color={categoryColors[article.category]}
                    />
                    <Box>
                      <IconButton size="small" onClick={() => handleOpenDialog(article)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(article.id)} color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography variant="h6" gutterBottom>
                    {article.title}
                  </Typography>

                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {formatDate(article.date)}
                  </Typography>

                  <Typography variant="body2" color="textSecondary" paragraph>
                    {article.content.length > 200 
                      ? `${article.content.substring(0, 200)}...` 
                      : article.content}
                  </Typography>

                  {article.pdf_name && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                      <PictureAsPdfIcon color="error" fontSize="small" />
                      <Typography variant="caption" color="textSecondary">
                        {article.pdf_name}
                      </Typography>
                      <IconButton size="small" onClick={() => handleDownloadPdf(article)}>
                        <AttachFileIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </CardContent>

                <CardActions>
                  <Button size="small" onClick={() => handleOpenDialog(article)}>
                    Read More
                  </Button>
                  <Typography variant="caption" color="textSecondary" sx={{ ml: 'auto' }}>
                    By {article.author}
                  </Typography>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create/Edit Article Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingArticle ? 'Edit Article' : 'Create New Article'}
        </DialogTitle>
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
                  label="Date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as NewsArticle['category'] })}
                  >
                    <MenuItem value="Dining">Dining</MenuItem>
                    <MenuItem value="Event">Events</MenuItem>
                    <MenuItem value="Club News">Club News</MenuItem>
                    <MenuItem value="Special Offer">Special Offers</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Author"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              placeholder="e.g., Club Secretary, Wine Committee"
            />

            <TextField
              fullWidth
              label="Content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              multiline
              rows={6}
              required
              placeholder="Write your news article here..."
            />

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Attach PDF (optional)
              </Typography>
              <input
                accept="application/pdf"
                style={{ display: 'none' }}
                id="pdf-upload"
                type="file"
                onChange={handlePdfChange}
              />
              <label htmlFor="pdf-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<AttachFileIcon />}
                  fullWidth
                >
                  {pdfFile ? pdfFile.name : 'Upload PDF (menu, flyer, etc.)'}
                </Button>
              </label>
              {pdfFile && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <PictureAsPdfIcon color="error" fontSize="small" />
                  <Typography variant="caption" color="textSecondary">
                    {pdfFile.name} ({(pdfFile.size / 1024).toFixed(1)} KB)
                  </Typography>
                </Box>
              )}
              {editingArticle?.pdf_name && !pdfFile && (
                <Typography variant="caption" color="textSecondary">
                  Current PDF: {editingArticle.pdf_name}
                </Typography>
              )}
            </Box>

            {uploading && (
              <Box sx={{ width: '100%', mt: 2 }}>
                <LinearProgress />
                <Typography variant="caption" color="textSecondary">
                  Uploading PDF...
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.title || !formData.content || uploading}
          >
            {editingArticle ? 'Update' : 'Create'} Article
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
