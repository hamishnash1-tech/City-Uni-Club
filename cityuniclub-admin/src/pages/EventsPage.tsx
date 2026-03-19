import { useState, useEffect, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { FUNCTIONS_URL } from '../services/supabase'
import { useAuth } from '../context/AuthContext'
import type { Event } from '../types'
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  LinearProgress
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import PeopleIcon from '@mui/icons-material/People'
import EventIcon from '@mui/icons-material/Event'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'

const eventTypeOptions = [
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'lunch_dinner', label: 'Lunch & Dinner' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'special', label: 'Special Event' }
]

const ADMIN_EVENTS_URL = `${FUNCTIONS_URL}/admin-events`

export default function EventsPage() {
  const navigate = useNavigate()
  const { sessionToken } = useAuth()
  const authHeaders = { 'Authorization': `Bearer ${sessionToken}`, 'Content-Type': 'application/json' }
  const [events, setEvents] = useState<Event[]>([])
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    event_date: '',
    event_type: 'lunch' as Event['event_type'],
    description: '',
    price: ''
  })

  useEffect(() => {
    fetch(ADMIN_EVENTS_URL, { headers: authHeaders })
      .then(r => r.json())
      .then(({ events: data, error }) => {
        if (error) {
          setError('Failed to load events')
        } else {
          setEvents((data ?? []).map((e: any) => ({
            id: e.id,
            title: e.title,
            event_date: e.event_date,
            event_type: e.event_type,
            description: e.description ?? '',
            price: e.price_per_person ?? null,
          })))
        }
        setLoading(false)
      })
      .catch(() => { setError('Failed to load events'); setLoading(false) })
  }, [])

  const handleOpenDialog = (event?: Event) => {
    if (event) {
      setEditingEvent(event)
      setFormData({
        title: event.title,
        event_date: event.event_date,
        event_type: event.event_type,
        description: event.description || '',
        price: event.price?.toString() || ''
      })
    } else {
      setEditingEvent(null)
      setFormData({
        title: '',
        event_date: '',
        event_type: 'lunch',
        description: '',
        price: ''
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingEvent(null)
    setPdfFile(null)
    setFormData({
      title: '',
      event_date: '',
      event_type: 'lunch',
      description: '',
      price: ''
    })
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

    try {
      const eventData = {
        title: formData.title,
        event_date: formData.event_date || null,
        event_type: formData.event_type,
        description: formData.description || null,
        price_per_person: formData.price ? parseFloat(formData.price) : null,
        is_tba: !formData.event_date || !formData.price,
      }

      // Handle PDF upload
      if (pdfFile) {
        setUploading(true)
        // In production, upload to Supabase Storage:
        // const { data, error } = await supabase.storage
        //   .from('event-pdfs')
        //   .upload(`events/${Date.now()}_${pdfFile.name}`, pdfFile)
        
        // Mock upload for demo
        await new Promise(resolve => setTimeout(resolve, 1000))
        eventData.pdf_url = `/event-pdfs/${pdfFile.name}`
        eventData.pdf_name = pdfFile.name
        setUploading(false)
      }

      if (editingEvent) {
        const res = await fetch(`${ADMIN_EVENTS_URL}?id=${editingEvent.id}`, { method: 'PUT', headers: authHeaders, body: JSON.stringify(eventData) })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setSuccess('Event updated successfully')
        setEvents(events.map(e => e.id === editingEvent.id ? { ...e, ...eventData, price: eventData.price_per_person } : e))
      } else {
        const res = await fetch(ADMIN_EVENTS_URL, { method: 'POST', headers: authHeaders, body: JSON.stringify(eventData) })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setSuccess('Event created successfully')
        setEvents([...events, { ...data.event, price: data.event.price_per_person }])
      }

      handleCloseDialog()
    } catch (err) {
      console.error('Error saving event:', err)
      setError(err instanceof Error ? err.message : 'Failed to save event')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      const res = await fetch(`${ADMIN_EVENTS_URL}?id=${id}`, { method: 'DELETE', headers: authHeaders })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      setSuccess('Event deleted successfully')
      setEvents(events.filter(e => e.id !== id))
    } catch (err) {
      console.error('Error deleting event:', err)
      setError('Failed to delete event')
    }
  }

  const getEventTypeLabel = (type: string) => {
    return eventTypeOptions.find(opt => opt.value === type)?.label || type
  }

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, 'primary' | 'secondary' | 'success' | 'info' | 'warning'> = {
      lunch: 'success',
      dinner: 'secondary',
      lunch_dinner: 'primary',
      meeting: 'info',
      special: 'warning'
    }
    return colors[type] || 'primary'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }


  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Events Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Create Event
        </Button>
      </Box>

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

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Grid container spacing={3}>
        {events.map((event) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={event.id}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6
                }
              }}
              onClick={() => navigate(`/events/${event.id}`)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Chip
                    label={getEventTypeLabel(event.event_type)}
                    color={getEventTypeColor(event.event_type)}
                    size="small"
                  />
                  <Box>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenDialog(event) }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(event.id) }} color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="h6" gutterBottom>
                  {event.title}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {formatDate(event.event_date)}
                    </Typography>
                  </Box>

                  {event.price !== null ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AttachMoneyIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        £{event.price}
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AttachMoneyIcon fontSize="small" color="action" />
                      <Typography variant="body2" fontStyle="italic">
                        Price TBA
                      </Typography>
                    </Box>
                  )}

                  {event.pdf_name && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <PictureAsPdfIcon color="error" fontSize="small" />
                      <Typography variant="caption" color="textSecondary" sx={{ flexGrow: 1 }}>
                        {event.pdf_name}
                      </Typography>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); alert('Download PDF: ' + event.pdf_name) }}>
                        <AttachFileIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PeopleIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      0 RSVPs
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create/Edit Event Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingEvent ? 'Edit Event' : 'Create New Event'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              fullWidth
              label="Event Name"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <TextField
              fullWidth
              label="Date"
              type="date"
              value={formData.event_date}
              onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              helperText="Leave blank for TBA events"
            />

            <FormControl fullWidth>
              <InputLabel>Event Type</InputLabel>
              <Select
                value={formData.event_type}
                label="Event Type"
                onChange={(e) => setFormData({ ...formData, event_type: e.target.value as Event['event_type'] })}
              >
                {eventTypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              placeholder="e.g., Date TBA, special notes..."
            />

            <TextField
              fullWidth
              label="Price (£)"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              placeholder="Leave empty for TBA"
            />

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Attach PDF (optional)
              </Typography>
              <input
                accept="application/pdf"
                style={{ display: 'none' }}
                id="event-pdf-upload"
                type="file"
                onChange={handlePdfChange}
              />
              <label htmlFor="event-pdf-upload">
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
              {editingEvent?.pdf_name && !pdfFile && (
                <Typography variant="caption" color="textSecondary">
                  Current PDF: {editingEvent.pdf_name}
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
            disabled={!formData.title || uploading}
          >
            {editingEvent ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
