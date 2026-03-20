import { useState, useEffect, useRef } from 'react'
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

interface Booking {
  id: string
  member_id: string | null
  member_email: string | null
  guest_name: string | null
  guest_phone: string | null
  guest_count: number
  special_requests: string | null
  status: string
  total_price: number | null
  created_at: string
  members: { full_name: string; email: string; membership_number: string } | null
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
  const { sessionToken } = useAuth()
  const authHeaders = { 'Authorization': `Bearer ${sessionToken}`, 'Content-Type': 'application/json' }

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
  }, [slug, sessionToken])

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
    } catch (e: any) {
      setError(e.message)
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
    } catch (e: any) {
      setError(e.message)
    }
    setEditingDescription(false)
  }

  const handleToggleVisibility = async () => {
    if (!event) return
    setSavingVisibility(true)
    try {
      await patch({ is_active: !event.is_active })
      setEvent(e => e ? { ...e, is_active: !e.is_active } : e)
      setSuccess(event.is_active ? 'Event hidden from public view' : 'Event is now visible')
    } catch (e: any) {
      setError(e.message)
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
    } catch (e: any) {
      setError(e.message || 'Upload failed')
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
    } catch (e: any) {
      setError(e.message)
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
    } catch (e: any) {
      setError(e.message)
    }
    setRenamingAssetId(null)
  }

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm('Cancel this booking?')) return
    setBookings(bookings.filter(b => b.id !== bookingId))
    setSuccess('Booking cancelled')
  }

  const memberBookings = bookings.filter(b => b.member_id)
  const nonMemberBookings = bookings.filter(b => !b.member_id)
  const totalTickets = bookings.reduce((sum, b) => sum + b.guest_count, 0)
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_price ?? 0), 0)

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
            {event.price_per_person != null && (
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachMoneyIcon color="action" />
                  <Box>
                    <Typography variant="body2" color="textSecondary">Price per person</Typography>
                    <Typography variant="body1" fontWeight={500}>£{event.price_per_person}</Typography>
                  </Box>
                </Box>
              </Grid>
            )}
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
                  <Typography variant="body1" fontWeight={500} color="success.main">£{totalRevenue.toFixed(2)}</Typography>
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

      {/* Member Bookings */}
      <Typography variant="h6" gutterBottom>Member Bookings ({memberBookings.length})</Typography>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Membership No.</TableCell>
              <TableCell>Tickets</TableCell>
              <TableCell>Special Requests</TableCell>
              <TableCell>Status</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {memberBookings.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center"><Typography color="textSecondary" sx={{ py: 2 }}>No member bookings</Typography></TableCell></TableRow>
            ) : memberBookings.map(b => (
              <TableRow key={b.id}>
                <TableCell>{b.members?.full_name ?? '—'}</TableCell>
                <TableCell>{b.members?.email ? <a href={`mailto:${b.members.email}`}>{b.members.email}</a> : '—'}</TableCell>
                <TableCell>{b.members?.membership_number ?? '—'}</TableCell>
                <TableCell>{b.guest_count}</TableCell>
                <TableCell>{b.special_requests ?? '—'}</TableCell>
                <TableCell><Chip label={b.status} size="small" color={b.status === 'confirmed' ? 'success' : 'warning'} /></TableCell>
                <TableCell><IconButton size="small" color="error" onClick={() => handleDeleteBooking(b.id)}><DeleteIcon fontSize="small" /></IconButton></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Non-Member Bookings */}
      <Typography variant="h6" gutterBottom>Non-Member Bookings ({nonMemberBookings.length})</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Tickets</TableCell>
              <TableCell>Special Requests</TableCell>
              <TableCell>Status</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {nonMemberBookings.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center"><Typography color="textSecondary" sx={{ py: 2 }}>No non-member bookings</Typography></TableCell></TableRow>
            ) : nonMemberBookings.map(b => (
              <TableRow key={b.id}>
                <TableCell>{b.guest_name ?? '—'}</TableCell>
                <TableCell>{b.member_email ? <a href={`mailto:${b.member_email}`}>{b.member_email}</a> : '—'}</TableCell>
                <TableCell>{b.guest_phone ?? '—'}</TableCell>
                <TableCell>{b.guest_count}</TableCell>
                <TableCell>{b.special_requests ?? '—'}</TableCell>
                <TableCell><Chip label={b.status} size="small" color={b.status === 'confirmed' ? 'success' : 'warning'} /></TableCell>
                <TableCell><IconButton size="small" color="error" onClick={() => handleDeleteBooking(b.id)}><DeleteIcon fontSize="small" /></IconButton></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  )
}
