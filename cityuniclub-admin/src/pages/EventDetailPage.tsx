import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FUNCTIONS_URL } from '../services/supabase'
import { useAuth } from '../context/AuthContext'
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  LinearProgress,
  Switch,
  FormControlLabel,
  TextField,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Collapse,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import PeopleIcon from '@mui/icons-material/People'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import EventIcon from '@mui/icons-material/Event'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import ImageIcon from '@mui/icons-material/Image'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import RestoreIcon from '@mui/icons-material/Restore'
import HistoryIcon from '@mui/icons-material/History'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'

const ASSET_TYPES = ['Menu', 'Details', 'Location', 'Programme', 'Other']

interface EventAsset {
  id: string
  event_id: string
  type: string
  file_url: string
  file_name: string | null
  mime_type: string | null
  created_at: string
}

interface AuditEntry {
  booking_id: string
  action: string
  previous_value: Record<string, unknown> | null
  new_value: Record<string, unknown> | null
  performed_by_admin_email: string | null
  performed_at: string
}

interface Booking {
  id: string
  member_id: string | null
  guest_email: string | null
  guest_name: string | null
  guest_phone: string | null
  guest_count: number
  special_requests: string | null
  status: string
  total_price: number | null
  created_at: string
  members: { full_name: string; email: string; membership_number: string } | null
  audit_log: AuditEntry[]
}

interface EventDetails {
  id: string
  title: string
  event_date: string | null
  event_type: string
  description: string | null
  price_per_person: number | null
  is_tba: boolean
  is_active: boolean
  slug: string
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  lunch: 'Lunch', dinner: 'Dinner', lunch_dinner: 'Lunch & Dinner',
  meeting: 'Meeting', special: 'Special Event',
}
const EVENT_TYPE_COLORS: Record<string, 'primary' | 'secondary' | 'success' | 'info' | 'warning'> = {
  lunch: 'success', dinner: 'secondary', lunch_dinner: 'primary', meeting: 'info', special: 'warning',
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Date TBA'
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

function AssetIcon({ mimeType }: { mimeType: string | null }) {
  if (mimeType?.startsWith('image/')) return <ImageIcon color="primary" fontSize="small" />
  if (mimeType === 'application/pdf') return <PictureAsPdfIcon color="error" fontSize="small" />
  return <InsertDriveFileIcon color="action" fontSize="small" />
}

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { sessionToken, user } = useAuth()
  const authHeaders = useMemo(() => ({ 'Authorization': `Bearer ${sessionToken}`, 'Content-Type': 'application/json' }), [sessionToken])

  const [event, setEvent] = useState<EventDetails | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [assets, setAssets] = useState<EventAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Inline editing
  const [editingTitle, setEditingTitle] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editingDescription, setEditingDescription] = useState(false)
  const [editDescription, setEditDescription] = useState('')
  const [editingPrice, setEditingPrice] = useState(false)
  const [editPrice, setEditPrice] = useState('')

  // Asset rename
  const [renamingAssetId, setRenamingAssetId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  // Asset upload
  const [assetFiles, setAssetFiles] = useState<File[]>([])
  const [assetType, setAssetType] = useState('Menu')
  const [assetDisplayName, setAssetDisplayName] = useState('')
  const [uploadingAsset, setUploadingAsset] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [assetDocWarning, setAssetDocWarning] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Visibility
  const [savingVisibility, setSavingVisibility] = useState(false)

  // Notes editing
  const [editingNotes, setEditingNotes] = useState<{ id: string; value: string } | null>(null)

  // Store the UUID separately for mutations (URL uses slug)
  const [eventUuid, setEventUuid] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    if (!sessionToken) { setError('Not authenticated'); setLoading(false); return }
    fetch(`${FUNCTIONS_URL}/admin-events?slug=${encodeURIComponent(slug)}`, { headers: authHeaders })
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) { setError('Session expired — please sign in again.'); return }
        const data = await res.json()
        if (data.event) {
          setEvent(data.event)
          setEventUuid(data.event.id)
          setEditTitle(data.event.title)
          setEditDescription(data.event.description ?? '')
        } else setError('Event not found')
        setBookings(data.bookings ?? [])
        setAssets(data.pdfs ?? [])
      })
      .catch(() => setError('Failed to load event'))
      .finally(() => setLoading(false))
  }, [slug, sessionToken, authHeaders])

  const patch = async (fields: Record<string, unknown>) => {
    const res = await fetch(`${FUNCTIONS_URL}/admin-events?id=${eventUuid}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(fields),
    })
    if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
    return res.json()
  }

  const handleSaveTitle = async () => {
    if (!editTitle.trim() || editTitle === event?.title) { setEditingTitle(false); return }
    try {
      await patch({ title: editTitle.trim() })
      setEvent(e => e ? { ...e, title: editTitle.trim() } : e)
      setSuccess('Title updated')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    }
    setEditingTitle(false)
  }

  const handleSaveDescription = async () => {
    const desc = editDescription.trim() || null
    if (desc === (event?.description ?? null)) { setEditingDescription(false); return }
    try {
      await patch({ description: desc })
      setEvent(e => e ? { ...e, description: desc } : e)
      setSuccess('Description updated')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    }
    setEditingDescription(false)
  }

  const handleSavePrice = async () => {
    const parsed = editPrice.trim() === '' ? null : Number.parseFloat(editPrice)
    if (parsed !== null && (Number.isNaN(parsed) || parsed < 0)) { setError('Invalid price'); return }
    if (parsed === (event?.price_per_person ?? null)) { setEditingPrice(false); return }
    try {
      await patch({ price_per_person: parsed })
      setEvent(e => e ? { ...e, price_per_person: parsed } : e)
      setSuccess('Price updated')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    }
    setEditingPrice(false)
  }

  const handleToggleVisibility = async () => {
    if (!event) return
    setSavingVisibility(true)
    try {
      await patch({ is_active: !event.is_active })
      setEvent(e => e ? { ...e, is_active: !e.is_active } : e)
      setSuccess(event.is_active ? 'Event hidden from public view' : 'Event is now visible')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    }
    setSavingVisibility(false)
  }

  const handleAssetUpload = async () => {
    if (!assetFiles.length || !sessionToken || !eventUuid) return
    setUploadingAsset(true)
    const uploaded: EventAsset[] = []
    try {
      for (let i = 0; i < assetFiles.length; i++) {
        const file = assetFiles[i]
        if (assetFiles.length > 1) setUploadProgress(`Uploading ${i + 1} of ${assetFiles.length}…`)
        const displayName = assetFiles.length === 1
          ? (assetDisplayName.trim() || file.name)
          : file.name.replace(/\.[^.]+$/, '')
        const form = new FormData()
        form.append('file', file)
        form.append('event_id', eventUuid)
        form.append('type', assetType)
        form.append('file_name', displayName)
        const res = await fetch(`${FUNCTIONS_URL}/admin-event-assets`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${sessionToken}` },
          body: form,
        })
        const data = await res.json()
        if (!res.ok) throw new Error(`${file.name}: ${data.error}`)
        uploaded.push(data.asset)
      }
      setAssets(prev => [...prev, ...uploaded])
      setAssetFiles([])
      setAssetDisplayName('')
      setAssetType('Menu')
      setAssetDocWarning(false)
      setUploadProgress('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      setSuccess(`${uploaded.length} asset${uploaded.length > 1 ? 's' : ''} uploaded`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed')
      if (uploaded.length) setAssets(prev => [...prev, ...uploaded])
    }
    setUploadingAsset(false)
    setUploadProgress('')
  }

  const handleDeleteAsset = async (assetId: string) => {
    if (!confirm('Remove this asset?')) return
    try {
      const res = await fetch(`${FUNCTIONS_URL}/admin-event-assets?id=${assetId}`, {
        method: 'DELETE',
        headers: authHeaders,
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      setAssets(prev => prev.filter(a => a.id !== assetId))
      setSuccess('Asset removed')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    }
  }

  const handleRenameAsset = async (assetId: string) => {
    if (!renameValue.trim()) { setRenamingAssetId(null); return }
    try {
      const res = await fetch(`${FUNCTIONS_URL}/admin-event-assets?id=${assetId}`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ file_name: renameValue.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAssets(prev => prev.map(a => a.id === assetId ? { ...a, file_name: renameValue.trim() } : a))
      setSuccess('Asset renamed')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    }
    setRenamingAssetId(null)
  }

  const [expandedAuditRows, setExpandedAuditRows] = useState<Set<string>>(new Set())
  const [pendingAction, setPendingAction] = useState<{
    type: 'status' | 'guest_count' | 'notes'
    booking: Booking
    newStatus?: string
    newGuestCount?: number
    newNotes?: string
  } | null>(null)

  const toggleAuditRow = (id: string) => {
    setExpandedAuditRows(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  const handleUpdateBooking = async (bookingId: string, updates: { status?: string; guest_count?: number }) => {
    try {
      const res = await fetch(`${FUNCTIONS_URL}/admin-events`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ booking_id: bookingId, ...updates }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      const now = new Date().toISOString()
      setBookings(prev => prev.map(b => {
        if (b.id !== bookingId) return b
        const updated = { ...b, ...updates }
        const entries: AuditEntry[] = []
        if (updates.status) entries.push({ booking_id: bookingId, action: `status_changed_to_${updates.status}`, previous_value: { status: b.status }, new_value: { status: updates.status }, performed_by_admin_email: user?.email ?? null, performed_at: now })
        if (updates.guest_count !== undefined) entries.push({ booking_id: bookingId, action: 'guest_count_updated', previous_value: { guest_count: b.guest_count }, new_value: { guest_count: updates.guest_count }, performed_by_admin_email: user?.email ?? null, performed_at: now })
        return { ...updated, audit_log: [...entries, ...b.audit_log] }
      }))
      setSuccess(updates.status ? `Booking ${updates.status}` : 'Guest count updated')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    }
  }

  const handleDeleteBooking = (booking: Booking) => {
    setPendingAction({ type: 'status', booking, newStatus: 'cancelled' })
  }

  const executePendingAction = async () => {
    if (!pendingAction) return
    const { type, booking, newStatus, newGuestCount, newNotes } = pendingAction
    setPendingAction(null)
    if (type === 'guest_count') {
      await handleUpdateBooking(booking.id, { guest_count: newGuestCount })
    } else if (type === 'notes') {
      try {
        const res = await fetch(`${FUNCTIONS_URL}/admin-events`, {
          method: 'PATCH',
          headers: authHeaders,
          body: JSON.stringify({ booking_id: booking.id, special_requests: newNotes || null }),
        })
        if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
        const now = new Date().toISOString()
        setBookings(prev => prev.map(b => {
          if (b.id !== booking.id) return b
          const entry: AuditEntry = { booking_id: booking.id, action: 'notes_updated', previous_value: { special_requests: b.special_requests }, new_value: { special_requests: newNotes || null }, performed_by_admin_email: user?.email ?? null, performed_at: now }
          return { ...b, special_requests: newNotes || null, audit_log: [entry, ...b.audit_log] }
        }))
        setSuccess('Notes updated')
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Unknown error')
      }
    } else {
      await handleUpdateBooking(booking.id, { status: newStatus })
    }
  }

  const activeBookings = bookings.filter(b => b.status !== 'cancelled')
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled')
  const memberBookings = activeBookings.filter(b => b.member_id)
  const nonMemberBookings = activeBookings.filter(b => !b.member_id)
  const cancelledMemberBookings = cancelledBookings.filter(b => b.member_id)
  const cancelledNonMemberBookings = cancelledBookings.filter(b => !b.member_id)
  const totalTickets = bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + b.guest_count, 0)
  const confirmedRevenue = bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + (b.total_price ?? 0), 0)
  const pendingRevenue = bookings.filter(b => b.status === 'pending').reduce((sum, b) => sum + (b.total_price ?? 0), 0)

  if (loading) return <Container maxWidth="lg" sx={{ mt: 4 }}><LinearProgress /></Container>

  if (!event) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Event not found'}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/events')} sx={{ mt: 2 }}>Back to Events</Button>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/events')}>Back to Events</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Event Details Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>

          {/* Title row */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2, gap: 2 }}>
            {editingTitle ? (
              <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
                <TextField
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  size="small"
                  fullWidth
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') handleSaveTitle(); if (e.key === 'Escape') setEditingTitle(false) }}
                />
                <IconButton size="small" color="primary" onClick={handleSaveTitle}><CheckIcon /></IconButton>
                <IconButton size="small" onClick={() => { setEditingTitle(false); setEditTitle(event.title) }}><CloseIcon /></IconButton>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                <Typography variant="h5">{event.title}</Typography>
                <IconButton size="small" onClick={() => setEditingTitle(true)} title="Edit title">
                  <EditIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
            <Chip
              label={EVENT_TYPE_LABELS[event.event_type] ?? event.event_type}
              color={EVENT_TYPE_COLORS[event.event_type] ?? 'primary'}
            />
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Stats row */}
          <Grid container spacing={3} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventIcon color="action" />
                <Box>
                  <Typography variant="body2" color="textSecondary">Date</Typography>
                  <Typography variant="body1" fontWeight={500}>{formatDate(event.event_date)}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachMoneyIcon color="action" />
                <Box>
                  <Typography variant="body2" color="textSecondary">Price per person</Typography>
                  {editingPrice ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TextField
                        size="small"
                        value={editPrice}
                        onChange={e => setEditPrice(e.target.value)}
                        inputProps={{ inputMode: 'decimal', style: { width: 80 } }}
                        placeholder="e.g. 45.00"
                        autoFocus
                        onKeyDown={e => { if (e.key === 'Enter') handleSavePrice(); if (e.key === 'Escape') setEditingPrice(false) }}
                      />
                      <IconButton size="small" color="success" onClick={handleSavePrice}><CheckIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => setEditingPrice(false)}><CloseIcon fontSize="small" /></IconButton>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="body1" fontWeight={500}>
                        {event.price_per_person != null ? `£${event.price_per_person}` : 'Free / TBA'}
                      </Typography>
                      <IconButton size="small" onClick={() => { setEditPrice(event.price_per_person?.toString() ?? ''); setEditingPrice(true) }}>
                        <EditIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PeopleIcon color="action" />
                <Box>
                  <Typography variant="body2" color="textSecondary">Total Tickets</Typography>
                  <Typography variant="body1" fontWeight={500}>{totalTickets}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachMoneyIcon color="success" />
                <Box>
                  <Typography variant="body2" color="textSecondary">Revenue</Typography>
                  <Typography variant="body1" fontWeight={500} color="success.main">
                    £{confirmedRevenue.toFixed(2)}
                    {pendingRevenue > 0 && <Typography component="span" variant="body2" color="text.secondary"> (£{pendingRevenue.toFixed(2)} pending)</Typography>}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 2 }} />

          {/* Description */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="body2" fontWeight={500}>Description</Typography>
              {!editingDescription && (
                <IconButton size="small" onClick={() => setEditingDescription(true)} title="Edit description">
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
            {editingDescription ? (
              <Box>
                <TextField
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  multiline
                  rows={3}
                  fullWidth
                  size="small"
                  autoFocus
                  placeholder="Event description (optional)"
                />
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button size="small" variant="contained" startIcon={<CheckIcon />} onClick={handleSaveDescription}>Save</Button>
                  <Button size="small" startIcon={<CloseIcon />} onClick={() => { setEditingDescription(false); setEditDescription(event?.description ?? '') }}>Cancel</Button>
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" color={event.description ? 'textPrimary' : 'textSecondary'}>
                {event.description || 'No description'}
              </Typography>
            )}
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Visibility toggle */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={event.is_active}
                  onChange={handleToggleVisibility}
                  disabled={savingVisibility}
                  color="success"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    {event.is_active ? 'Visible to members' : 'Hidden from members'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {event.is_active ? 'This event appears on the website and app' : 'This event is not shown publicly'}
                  </Typography>
                </Box>
              }
            />
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Assets section */}
          <Box>
            <Typography variant="body2" fontWeight={500} gutterBottom>Event Assets</Typography>

            {/* Existing assets list */}
            {assets.length > 0 && (
              <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {assets.map(asset => (
                  <Box key={asset.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <AssetIcon mimeType={asset.mime_type} />
                    <Chip label={asset.type} size="small" variant="outlined" sx={{ fontSize: '0.7rem', flexShrink: 0 }} />
                    {renamingAssetId === asset.id ? (
                      <>
                        <TextField
                          size="small"
                          value={renameValue}
                          onChange={e => setRenameValue(e.target.value)}
                          autoFocus
                          sx={{ flex: 1 }}
                          onKeyDown={e => { if (e.key === 'Enter') handleRenameAsset(asset.id); if (e.key === 'Escape') setRenamingAssetId(null) }}
                        />
                        <IconButton size="small" color="primary" onClick={() => handleRenameAsset(asset.id)}><CheckIcon /></IconButton>
                        <IconButton size="small" onClick={() => setRenamingAssetId(null)}><CloseIcon /></IconButton>
                      </>
                    ) : (
                      <>
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          <a href={asset.file_url} target="_blank" rel="noopener noreferrer">
                            {asset.file_name || asset.file_url}
                          </a>
                        </Typography>
                        <IconButton size="small" onClick={() => { setRenamingAssetId(asset.id); setRenameValue(asset.file_name || '') }} title="Rename">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteAsset(asset.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Box>
                ))}
              </Box>
            )}

            {/* Add new asset */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="caption" color="textSecondary" fontWeight={500}>Add Assets</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 130 }}>
                  <InputLabel>Type</InputLabel>
                  <Select value={assetType} label="Type" onChange={e => setAssetType(e.target.value)}>
                    {ASSET_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </Select>
                </FormControl>
                {assetFiles.length === 1 && (
                  <TextField
                    size="small"
                    label="Display name"
                    value={assetDisplayName}
                    onChange={e => setAssetDisplayName(e.target.value)}
                    placeholder="e.g. Summer Menu 2026"
                    sx={{ flex: 1, minWidth: 180 }}
                  />
                )}
              </Box>
              <input
                type="file"
                multiple
                accept="application/pdf,image/*,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={e => {
                  const files = Array.from(e.target.files ?? [])
                  setAssetFiles(files)
                  if (files.length === 1) setAssetDisplayName(files[0].name.replace(/\.[^.]+$/, ''))
                  else setAssetDisplayName('')
                  setAssetDocWarning(files.some(f => /\.(doc|docx)$/i.test(f.name)))
                }}
              />
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<UploadFileIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAsset}
                >
                  {assetFiles.length === 0 ? 'Choose files' : assetFiles.length === 1 ? assetFiles[0].name : `${assetFiles.length} files selected`}
                </Button>
                {assetFiles.length > 0 && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleAssetUpload}
                    disabled={uploadingAsset}
                  >
                    {uploadingAsset ? (uploadProgress || 'Uploading…') : `Upload ${assetFiles.length > 1 ? `${assetFiles.length} files` : ''}`}
                  </Button>
                )}
              </Box>
              {assetDocWarning && (
                <Alert severity="warning" sx={{ py: 0.5 }}>
                  Word documents may not display correctly on all devices. We recommend converting to PDF before uploading.
                </Alert>
              )}
              {uploadingAsset && <LinearProgress />}
            </Box>
          </Box>

        </CardContent>
      </Card>

      {/* Bookings */}
      {[
        { label: 'Member Bookings', list: memberBookings, isMember: true },
        { label: 'Non-Member Bookings', list: nonMemberBookings, isMember: false },
      ].map(({ label, list, isMember }) => (
        <Box key={label} sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>{label} ({list.length})</Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width={32} />
                  <TableCell>{isMember ? 'Member' : 'Guest'}</TableCell>
                  <TableCell>Email</TableCell>
                  {isMember && <TableCell>Membership No.</TableCell>}
                  {!isMember && <TableCell>Phone</TableCell>}
                  <TableCell>Tickets</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {list.length === 0 ? (
                  <TableRow><TableCell colSpan={8} align="center"><Typography color="textSecondary" sx={{ py: 2 }}>No bookings</Typography></TableCell></TableRow>
                ) : list.map(b => {
                  const isExpanded = expandedAuditRows.has(b.id)
                  const hasAudit = b.audit_log?.length > 0
                  return (
                    <>
                      <TableRow key={b.id} hover>
                        <TableCell>
                          {hasAudit && (
                            <Tooltip title="View history">
                              <IconButton size="small" onClick={() => toggleAuditRow(b.id)}>
                                {isExpanded ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                        <TableCell>{isMember ? (b.members?.full_name ?? '—') : (b.guest_name ?? '—')}</TableCell>
                        <TableCell>{isMember ? (b.members?.email ?? '—') : (b.guest_email ?? '—')}</TableCell>
                        {isMember && <TableCell>{b.members?.membership_number ?? '—'}</TableCell>}
                        {!isMember && <TableCell>{b.guest_phone ?? '—'}</TableCell>}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <IconButton size="small" disabled={b.guest_count <= 1} onClick={() => setPendingAction({ type: 'guest_count', booking: b, newGuestCount: b.guest_count - 1 })}>−</IconButton>
                            <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center' }}>{b.guest_count}</Typography>
                            <IconButton size="small" onClick={() => setPendingAction({ type: 'guest_count', booking: b, newGuestCount: b.guest_count + 1 })}>+</IconButton>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {editingNotes?.id === b.id ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <TextField size="small" value={editingNotes.value}
                                onChange={e => setEditingNotes({ id: b.id, value: e.target.value.slice(0, 256) })}
                                inputProps={{ maxLength: 256 }} sx={{ width: 200 }} autoFocus />
                              <Button size="small" variant="contained" onClick={() => { setPendingAction({ type: 'notes', booking: b, newNotes: editingNotes.value }); setEditingNotes(null) }}>Save</Button>
                              <Button size="small" onClick={() => setEditingNotes(null)}>Cancel</Button>
                            </Box>
                          ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography variant="body2" sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {b.special_requests || '—'}
                              </Typography>
                              <IconButton size="small" onClick={() => setEditingNotes({ id: b.id, value: b.special_requests || '' })}>
                                <EditIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Box>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip label={b.status} size="small" color={b.status === 'confirmed' ? 'success' : 'warning'} />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {b.status === 'pending' && (
                              <Tooltip title="Confirm">
                                <IconButton size="small" color="success" onClick={() => setPendingAction({ type: 'status', booking: b, newStatus: 'confirmed' })}>
                                  <CheckCircleIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Cancel">
                              <IconButton size="small" color="error" onClick={() => handleDeleteBooking(b)}>
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                      {hasAudit && (
                        <TableRow key={`${b.id}-audit`}>
                          <TableCell colSpan={8} sx={{ py: 0, bgcolor: 'grey.50' }}>
                            <Collapse in={isExpanded} unmountOnExit>
                              <Box sx={{ py: 1.5, px: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                  <HistoryIcon fontSize="small" color="action" />
                                  <Typography variant="caption" fontWeight={600} color="textSecondary">Audit History</Typography>
                                </Box>
                                {b.audit_log.map((entry, i) => (
                                  <Box key={i} sx={{ display: 'flex', gap: 2, mb: 0.5, alignItems: 'baseline' }}>
                                    <Typography variant="caption" color="textSecondary" sx={{ minWidth: 140 }}>
                                      {new Date(entry.performed_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                                      {entry.action.replace(/_/g, ' ')}
                                    </Typography>
                                    {entry.previous_value && entry.new_value && (
                                      <Typography variant="caption" color="textSecondary">
                                        {Object.keys(entry.new_value).map(k => `${k}: ${(entry.previous_value as Record<string, unknown>)[k]} → ${(entry.new_value as Record<string, unknown>)[k]}`).join(', ')}
                                      </Typography>
                                    )}
                                    {entry.performed_by_admin_email && (
                                      <Typography variant="caption" color="textSecondary">· {entry.performed_by_admin_email}</Typography>
                                    )}
                                  </Box>
                                ))}
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}

      {/* Cancelled Bookings */}
      {cancelledBookings.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'text.secondary' }}>
            Cancelled Bookings ({cancelledBookings.length})
          </Typography>
          {[
            { list: cancelledMemberBookings, isMember: true },
            { list: cancelledNonMemberBookings, isMember: false },
          ].filter(({ list }) => list.length > 0).map(({ list, isMember }) => (
            <TableContainer key={isMember ? 'cm' : 'cnm'} component={Paper} sx={{ mb: 2, opacity: 0.85 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width={32} />
                    <TableCell>{isMember ? 'Member' : 'Guest'}</TableCell>
                    <TableCell>Email</TableCell>
                    {isMember && <TableCell>Membership No.</TableCell>}
                    {!isMember && <TableCell>Phone</TableCell>}
                    <TableCell>Tickets</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {list.map(b => {
                    const isExpanded = expandedAuditRows.has(b.id)
                    const hasAudit = b.audit_log?.length > 0
                    return (
                      <>
                        <TableRow key={b.id} hover>
                          <TableCell>
                            {hasAudit && (
                              <Tooltip title="View history">
                                <IconButton size="small" onClick={() => toggleAuditRow(b.id)}>
                                  {isExpanded ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                          <TableCell>{isMember ? (b.members?.full_name ?? '—') : (b.guest_name ?? '—')}</TableCell>
                          <TableCell>{isMember ? (b.members?.email ?? '—') : (b.guest_email ?? '—')}</TableCell>
                          {isMember && <TableCell>{b.members?.membership_number ?? '—'}</TableCell>}
                          {!isMember && <TableCell>{b.guest_phone ?? '—'}</TableCell>}
                          <TableCell>{b.guest_count}</TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {b.special_requests || '—'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Button size="small" variant="outlined" color="warning" startIcon={<RestoreIcon />}
                              onClick={() => setPendingAction({ type: 'status', booking: b, newStatus: 'pending' })}>
                              Uncancel
                            </Button>
                          </TableCell>
                        </TableRow>
                        {hasAudit && (
                          <TableRow key={`${b.id}-audit`}>
                            <TableCell colSpan={8} sx={{ py: 0, bgcolor: 'grey.50' }}>
                              <Collapse in={isExpanded} unmountOnExit>
                                <Box sx={{ py: 1.5, px: 2 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                    <HistoryIcon fontSize="small" color="action" />
                                    <Typography variant="caption" fontWeight={600} color="textSecondary">Audit History</Typography>
                                  </Box>
                                  {b.audit_log.map((entry, i) => (
                                    <Box key={i} sx={{ display: 'flex', gap: 2, mb: 0.5, alignItems: 'baseline' }}>
                                      <Typography variant="caption" color="textSecondary" sx={{ minWidth: 140 }}>
                                        {new Date(entry.performed_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                      </Typography>
                                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                                        {entry.action.replace(/_/g, ' ')}
                                      </Typography>
                                      {entry.previous_value && entry.new_value && (
                                        <Typography variant="caption" color="textSecondary">
                                          {Object.keys(entry.new_value).map(k => `${k}: ${(entry.previous_value as Record<string, unknown>)[k]} → ${(entry.new_value as Record<string, unknown>)[k]}`).join(', ')}
                                        </Typography>
                                      )}
                                      {entry.performed_by_admin_email && (
                                        <Typography variant="caption" color="textSecondary">· {entry.performed_by_admin_email}</Typography>
                                      )}
                                    </Box>
                                  ))}
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ))}
        </Box>
      )}
      {/* Confirmation Dialog */}
      <Dialog open={!!pendingAction} onClose={() => setPendingAction(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          {pendingAction && (() => {
            const b = pendingAction.booking
            const name = b.members?.full_name || b.guest_name || '—'
            const email = b.members?.email || b.guest_email || '—'
            const actionLabel = pendingAction.type === 'guest_count'
              ? `Update guest count to ${pendingAction.newGuestCount}`
              : pendingAction.type === 'notes' ? 'Update notes'
              : pendingAction.newStatus === 'confirmed' ? 'Confirm booking'
              : pendingAction.newStatus === 'cancelled' ? 'Cancel booking'
              : 'Uncancel booking'
            return (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                <Typography variant="body2"><strong>Action:</strong> {actionLabel}</Typography>
                <Typography variant="body2"><strong>Date:</strong> {formatDate(event?.event_date ?? null)}</Typography>
                <Typography variant="body2"><strong>Name:</strong> {name}</Typography>
                <Typography variant="body2"><strong>Email:</strong> {email}</Typography>
                <Typography variant="body2"><strong>Guests:</strong> {pendingAction.type === 'guest_count' ? `${b.guest_count} → ${pendingAction.newGuestCount}` : b.guest_count}</Typography>
                <Typography variant="body2"><strong>Notes:</strong> {pendingAction.type === 'notes' ? `${b.special_requests || '(none)'} → ${pendingAction.newNotes || '(none)'}` : (b.special_requests || '—')}</Typography>
              </Box>
            )
          })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingAction(null)}>Cancel</Button>
          <Button variant="contained" onClick={executePendingAction}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
