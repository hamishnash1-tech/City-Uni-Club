import { useState, useEffect, useMemo } from 'react'
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
  const authHeaders = useMemo(() => ({ 'Authorization': `Bearer ${sessionToken}`, 'Content-Type': 'application/json' }), [sessionToken])
  const [events, setEvents] = useState<Event[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [showPast, setShowPast] = useState(false)
  const [pastEvents, setPastEvents] = useState<Event[]>([])
  const [pastLoading, setPastLoading] = useState(false)
  const [pastPage, setPastPage] = useState(0)
  const [pastTotal, setPastTotal] = useState(0)
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    event_date: '',
    event_type: 'lunch' as Event['event_type'],
    description: '',
    price: ''
  })

  const generateSlug = (title: string, date: string, shortId?: number) => {
    const datePart = date || 'tba'
    const titlePart = title.trim()
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const idPart = shortId ?? ''
    return `${datePart}-${titlePart}${idPart ? `-${idPart}` : ''}`
  }

  useEffect(() => {
    fetch(ADMIN_EVENTS_URL, { headers: authHeaders })
      .then(r => r.json())
      .then(({ events: data, error }) => {
        if (error) {
          setError('Failed to load events')
        } else {
          setEvents((data ?? []).map((e: { id: string; short_id: number; slug: string; title: string; event_date: string; event_type: Event['event_type']; description?: string; price_per_person?: number | null }) => ({
            id: e.id,
            short_id: e.short_id,
            slug: e.slug,
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
  }, [authHeaders])

  const fetchPastEvents = async (page: number) => {
    setPastLoading(true)
    try {
      const res = await fetch(`${ADMIN_EVENTS_URL}?past=true&past_page=${page}`, { headers: authHeaders })
      const json = await res.json()
      const mapped = (json.events ?? []).map((e: { id: string; short_id: number; slug: string; title: string; event_date: string; event_type: Event['event_type']; description?: string; price_per_person?: number | null }) => ({
        id: e.id, short_id: e.short_id, slug: e.slug, title: e.title,
        event_date: e.event_date, event_type: e.event_type,
        description: e.description ?? '', price: e.price_per_person ?? null,
      }))
      setPastEvents(mapped)
      setPastTotal(json.total ?? 0)
      setPastPage(page)
    } catch {
      setError('Failed to load past events')
    } finally {
      setPastLoading(false)
    }
  }

  const handleTogglePast = () => {
    if (!showPast && pastEvents.length === 0) fetchPastEvents(0)
    setShowPast(p => !p)
  }

  const handleOpenDialog = (event?: Event) => {
    if (event) {
      setEditingEvent(event)
      setFormData({
        title: event.title,
        slug: event.slug,
        event_date: event.event_date ?? '',
        event_type: event.event_type,
        description: event.description || '',
        price: event.price?.toString() || ''
      })
    } else {
      setEditingEvent(null)
      setFormData({
        title: '',
        slug: '',
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
    setFormData({
      title: '',
      slug: '',
      event_date: '',
      event_type: 'lunch',
      description: '',
      price: ''
    })
  }

  const handleSubmit = async () => {
    setError('')
    setSuccess('')

    try {
      const eventData = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title, formData.event_date, editingEvent?.short_id),
        event_date: formData.event_date || null,
        event_type: formData.event_type,
        description: formData.description || null,
        price_per_person: formData.price ? Number.parseFloat(formData.price) : null,
        is_tba: !formData.event_date || !formData.price,
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Date TBA'
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
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
              onClick={() => navigate(`/events/${event.slug}`)}
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

      {/* Past Events Toggle */}
      <Box sx={{ mt: 4 }}>
        <Button
          variant="text"
          onClick={handleTogglePast}
          sx={{ mb: 2 }}
        >
          {showPast ? '▲ Hide Past Events' : '▼ Show Past Events'}
          {pastTotal > 0 && ` (${pastTotal})`}
        </Button>

        {showPast && (
          <>
            {pastLoading && <LinearProgress sx={{ mb: 2 }} />}
            <Grid container spacing={3}>
              {pastEvents.map((event) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={event.id}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      opacity: 0.75,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: 6, opacity: 1 }
                    }}
                    onClick={() => navigate(`/events/${event.slug}`)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Chip label={getEventTypeLabel(event.event_type)} color={getEventTypeColor(event.event_type)} size="small" />
                        <Box>
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenDialog(event) }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(event.id) }} color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      <Typography variant="h6" gutterBottom>{event.title}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EventIcon fontSize="small" color="action" />
                        <Typography variant="body2">{formatDate(event.event_date)}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {pastTotal > 50 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
                <Button disabled={pastPage === 0} onClick={() => fetchPastEvents(pastPage - 1)}>← Previous</Button>
                <Typography variant="body2" sx={{ alignSelf: 'center' }}>
                  Page {pastPage + 1} of {Math.ceil(pastTotal / 50)}
                </Typography>
                <Button disabled={(pastPage + 1) * 50 >= pastTotal} onClick={() => fetchPastEvents(pastPage + 1)}>Next →</Button>
              </Box>
            )}
          </>
        )}
      </Box>

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
              onChange={(e) => {
                const title = e.target.value
                const autoSlug = generateSlug(title, formData.event_date, editingEvent?.short_id)
                setFormData({ ...formData, title, slug: autoSlug })
              }}
              required
            />

            <TextField
              fullWidth
              label="Date"
              type="date"
              value={formData.event_date}
              onChange={(e) => {
                const date = e.target.value
                const autoSlug = generateSlug(formData.title, date, editingEvent?.short_id)
                setFormData({ ...formData, event_date: date, slug: autoSlug })
              }}
              InputLabelProps={{ shrink: true }}
              helperText="Leave blank for TBA events"
            />

            <TextField
              fullWidth
              label="URL Slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
              helperText="Auto-generated — edit to customise. Format: date-text-id"
              InputProps={{ sx: { fontFamily: 'monospace', fontSize: '0.85rem' } }}
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

          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.title}
          >
            {editingEvent ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
