import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Collapse,
  Tooltip,
  TextField,
} from '@mui/material'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import CoffeeIcon from '@mui/icons-material/Coffee'
import LunchDiningIcon from '@mui/icons-material/LunchDining'
import PeopleIcon from '@mui/icons-material/People'
import MailIcon from '@mui/icons-material/Mail'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CloseIcon from '@mui/icons-material/Close'
import PersonIcon from '@mui/icons-material/Person'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import RestoreIcon from '@mui/icons-material/Restore'
import HistoryIcon from '@mui/icons-material/History'
import EditIcon from '@mui/icons-material/Edit'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { useAuth } from '../context/AuthContext'
import { FUNCTIONS_URL } from '../services/supabase'

interface AuditEntry {
  action: string
  previous_value: Record<string, any> | null
  new_value: Record<string, any> | null
  performed_by_admin_email: string | null
  performed_at: string
}

interface DiningReservation {
  id: string
  member_id: string | null
  reservation_date: string
  reservation_time: string
  meal_type: 'Breakfast' | 'Lunch'
  guest_count: number
  table_preference?: string
  special_requests?: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  created_at: string
  guest_name?: string | null
  guest_email?: string | null
  members?: {
    full_name: string
    email: string
    membership_number: string
  } | null
  audit_log: AuditEntry[]
}

// Club opening days (Tuesday=2, Wednesday=3, Thursday=4, Friday=5)
const OPENING_DAYS = [2, 3, 4, 5]
const OPENING_DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const generateAvailableDates = () => {
  const dates = []
  const today = new Date()

  for (let i = -1; i < 30; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)

    if (OPENING_DAYS.includes(date.getDay())) {
      dates.push({
        date: date.toISOString().split('T')[0],
        dayName: OPENING_DAY_NAMES[date.getDay()],
        fullDate: date.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }),
        weekday: date.toLocaleDateString('en-GB', { weekday: 'short' })
      })
    }
  }

  return dates
}

function AuditLog({ entries }: { entries: AuditEntry[] }) {
  return (
    <Box sx={{ py: 1.5, px: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
        <HistoryIcon fontSize="small" color="action" />
        <Typography variant="caption" fontWeight={600} color="textSecondary">Audit History</Typography>
      </Box>
      {entries.map((entry, i) => (
        <Box key={i} sx={{ display: 'flex', gap: 2, mb: 0.5, alignItems: 'baseline', flexWrap: 'wrap' }}>
          <Typography variant="caption" color="textSecondary" sx={{ minWidth: 140 }}>
            {new Date(entry.performed_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </Typography>
          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
            {entry.action.replace(/_/g, ' ')}
          </Typography>
          {entry.previous_value && entry.new_value && (
            <Typography variant="caption" color="textSecondary">
              {Object.keys(entry.new_value).map(k => `${k}: ${entry.previous_value![k]} → ${entry.new_value![k]}`).join(', ')}
            </Typography>
          )}
          {entry.performed_by_admin_email && (
            <Typography variant="caption" color="textSecondary">· {entry.performed_by_admin_email}</Typography>
          )}
        </Box>
      ))}
    </Box>
  )
}

export default function DiningPage() {
  const { sessionToken, user } = useAuth()
  const [reservations, setReservations] = useState<DiningReservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [openDayDialog, setOpenDayDialog] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [expandedAuditRows, setExpandedAuditRows] = useState<Set<string>>(new Set())
  const [editingGuestCount, setEditingGuestCount] = useState<{ id: string; value: number } | null>(null)
  const [editingNotes, setEditingNotes] = useState<{ id: string; value: string } | null>(null)
  const [pendingAction, setPendingAction] = useState<{
    type: 'status' | 'guest_count' | 'notes'
    id: string
    newStatus?: string
    newGuestCount?: number
    newNotes?: string
    reservation: DiningReservation
  } | null>(null)

  const toggleAuditRow = (id: string) => {
    setExpandedAuditRows(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const availableDates = useMemo(() => generateAvailableDates(), [])

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${sessionToken || localStorage.getItem('admin_token')}`
  })

  const fetchReservations = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const from = availableDates[0]?.date
      const to = availableDates[availableDates.length - 1]?.date
      const params = from && to ? `?from=${from}&to=${to}` : ''
      const res = await fetch(`${FUNCTIONS_URL}/admin-dining${params}`, {
        headers: getAuthHeaders()
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to fetch reservations')
      }
      const data = await res.json()
      setReservations(data.reservations || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [availableDates, sessionToken])

  useEffect(() => {
    fetchReservations()
  }, [fetchReservations])

  const confirmAndUpdateGuestCount = (reservation: DiningReservation, guest_count: number) => {
    setPendingAction({ type: 'guest_count', id: reservation.id, newGuestCount: guest_count, reservation })
  }

  const confirmAndUpdateStatus = (reservation: DiningReservation, status: string) => {
    setPendingAction({ type: 'status', id: reservation.id, newStatus: status, reservation })
  }

  const executePendingAction = async () => {
    if (!pendingAction) return
    const { type, id, newStatus, newGuestCount, newNotes } = pendingAction
    setPendingAction(null)
    try {
      if (type === 'guest_count') {
        const res = await fetch(`${FUNCTIONS_URL}/admin-dining`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({ id, guest_count: newGuestCount })
        })
        if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to update guest count') }
        const now = new Date().toISOString()
        setReservations(prev => prev.map(r => {
          if (r.id !== id) return r
          const entry: AuditEntry = { action: 'guest_count_updated', previous_value: { guest_count: r.guest_count }, new_value: { guest_count: newGuestCount }, performed_by_admin_email: user?.email ?? null, performed_at: now }
          return { ...r, guest_count: newGuestCount!, audit_log: [entry, ...(r.audit_log ?? [])] }
        }))
        setEditingGuestCount(null)
        setStatusMessage(`Guest count updated to ${newGuestCount}`)
      } else if (type === 'notes') {
        const res = await fetch(`${FUNCTIONS_URL}/admin-dining`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({ id, special_requests: newNotes || null })
        })
        if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to update notes') }
        const now = new Date().toISOString()
        setReservations(prev => prev.map(r => {
          if (r.id !== id) return r
          const entry: AuditEntry = { action: 'notes_updated', previous_value: { special_requests: r.special_requests ?? null }, new_value: { special_requests: newNotes || null }, performed_by_admin_email: user?.email ?? null, performed_at: now }
          return { ...r, special_requests: newNotes || undefined, audit_log: [entry, ...(r.audit_log ?? [])] }
        }))
        setEditingNotes(null)
        setStatusMessage('Notes updated')
      } else {
        const res = await fetch(`${FUNCTIONS_URL}/admin-dining`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({ id, status: newStatus })
        })
        if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to update status') }
        const now = new Date().toISOString()
        setReservations(prev => prev.map(r => {
          if (r.id !== id) return r
          const entry: AuditEntry = { action: `status_changed_to_${newStatus}`, previous_value: { status: r.status }, new_value: { status: newStatus }, performed_by_admin_email: user?.email ?? null, performed_at: now }
          return { ...r, status: newStatus as DiningReservation['status'], audit_log: [entry, ...(r.audit_log ?? [])] }
        }))
        setStatusMessage(`Reservation ${newStatus}`)
      }
      setTimeout(() => setStatusMessage(null), 3000)
    } catch (e: any) {
      setError(e.message)
    }
  }

  const handleUpdateNotes = (reservation: DiningReservation, notes: string) => {
    setPendingAction({ type: 'notes', id: reservation.id, newNotes: notes, reservation })
  }

  const reservationsByDate = useMemo(() => {
    const grouped: Record<string, DiningReservation[]> = {}
    reservations.forEach(res => {
      if (!grouped[res.reservation_date]) grouped[res.reservation_date] = []
      grouped[res.reservation_date].push(res)
    })
    return grouped
  }, [reservations])

  const dateStats = useMemo(() => {
    const stats: Record<string, { totalBookings: number; totalGuests: number; breakfast: number; lunch: number; confirmed: number; pending: number; cancelled: number }> = {}
    availableDates.forEach(({ date }) => {
      const all = reservationsByDate[date] || []
      const active = all.filter(r => r.status !== 'cancelled')
      stats[date] = {
        totalBookings: active.length,
        totalGuests: active.reduce((sum, r) => sum + r.guest_count, 0),
        breakfast: active.filter(r => r.meal_type === 'Breakfast').length,
        lunch: active.filter(r => r.meal_type === 'Lunch').length,
        confirmed: all.filter(r => r.status === 'confirmed').length,
        pending: all.filter(r => r.status === 'pending').length,
        cancelled: all.filter(r => r.status === 'cancelled').length,
      }
    })
    return stats
  }, [availableDates, reservationsByDate])

  const handleOpenDayDialog = (date: string) => {
    setSelectedDate(date)
    setOpenDayDialog(true)
  }

  const handleCloseDayDialog = () => {
    setOpenDayDialog(false)
    setSelectedDate(null)
  }

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email)
    setCopiedEmail(email)
    setTimeout(() => setCopiedEmail(null), 2000)
  }

  const getMealTypeIcon = (type: string) => {
    return type === 'Breakfast' ? <CoffeeIcon fontSize="small" /> : <LunchDiningIcon fontSize="small" />
  }

  const getMealTypeColor = (type: string) => {
    return type === 'Breakfast' ? 'default' : 'primary'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success'
      case 'cancelled': return 'error'
      case 'completed': return 'info'
      case 'no_show': return 'error'
      default: return 'warning'
    }
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  const selectedDateReservations = selectedDate ? (reservationsByDate[selectedDate] || []) : []
  const selectedDateInfo = availableDates.find(d => d.date === selectedDate)
  const memberReservations = selectedDateReservations.filter(r => r.member_id !== null && r.status !== 'cancelled')
  const nonMemberReservations = selectedDateReservations.filter(r => r.member_id === null && r.status !== 'cancelled')
  const cancelledReservations = selectedDateReservations.filter(r => r.status === 'cancelled')

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dining Reservations
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Club open Tuesday - Friday | Breakfast: 8:00-11:00 | Lunch: 12:00-14:30
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {availableDates.map(({ date, dayName, fullDate, weekday }) => {
          const stats = dateStats[date]
          const hasBookings = stats.totalBookings > 0

          return (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={date}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  },
                  border: hasBookings ? '2px solid' : '1px solid',
                  borderColor: hasBookings ? 'primary.main' : 'divider'
                }}
                onClick={() => handleOpenDayDialog(date)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        {dayName}
                      </Typography>
                      <Typography variant="h6">
                        {fullDate}
                      </Typography>
                    </Box>
                    <Chip
                      label={weekday}
                      size="small"
                      color={hasBookings ? 'primary' : 'default'}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PeopleIcon fontSize="small" color="action" />
                        <Typography variant="body2" fontWeight={500}>
                          {stats.totalGuests}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="textSecondary">
                        Guests
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <RestaurantIcon fontSize="small" color="action" />
                        <Typography variant="body2" fontWeight={500}>
                          {stats.totalBookings}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="textSecondary">
                        Bookings
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CoffeeIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {stats.breakfast}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="textSecondary">
                        Breakfast
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LunchDiningIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {stats.lunch}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="textSecondary">
                        Lunch
                      </Typography>
                    </Grid>
                  </Grid>

                  {hasBookings && (
                    <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
                      {stats.confirmed > 0 && (
                        <Chip label={`${stats.confirmed} confirmed`} size="small" color="success" variant="outlined" />
                      )}
                      {stats.pending > 0 && (
                        <Chip label={`${stats.pending} pending`} size="small" color="warning" variant="outlined" />
                      )}
                      {stats.cancelled > 0 && (
                        <Chip label={`${stats.cancelled} cancelled`} size="small" color="error" variant="outlined" />
                      )}
                    </Box>
                  )}
                </CardContent>

                <CardActions>
                  <Button size="small" fullWidth onClick={(e) => { e.stopPropagation(); handleOpenDayDialog(date) }}>
                    {hasBookings ? 'View Bookings' : 'View Day'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      <Dialog open={openDayDialog} onClose={handleCloseDayDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">{selectedDateInfo?.dayName}</Typography>
              <Typography variant="body2" color="textSecondary">{selectedDateInfo?.fullDate}</Typography>
            </Box>
            <IconButton onClick={handleCloseDayDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedDateReservations.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <RestaurantIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="textSecondary">
                No bookings for this day
              </Typography>
            </Box>
          ) : (
            <Box>
              {/* Member Bookings */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <PersonIcon color="primary" />
                  <Typography variant="h6">Member Bookings ({memberReservations.length})</Typography>
                </Box>
                {memberReservations.length === 0 ? (
                  <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
                    No member bookings for this day
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell width={32} />
                          <TableCell>Time</TableCell>
                          <TableCell>Member</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Meal</TableCell>
                          <TableCell>Guests</TableCell>
                          <TableCell>Notes</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {memberReservations
                          .sort((a, b) => a.reservation_time.localeCompare(b.reservation_time))
                          .map((reservation) => {
                            const isExpanded = expandedAuditRows.has(reservation.id)
                            const hasAudit = reservation.audit_log?.length > 0
                            return (
                              <>
                                <TableRow key={reservation.id} hover>
                                  <TableCell>
                                    {hasAudit && (
                                      <Tooltip title="View history">
                                        <IconButton size="small" onClick={() => toggleAuditRow(reservation.id)}>
                                          {isExpanded ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      {getMealTypeIcon(reservation.meal_type)}
                                      {formatTime(reservation.reservation_time)}
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" fontWeight={500}>
                                      {reservation.members?.full_name || '—'}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    {reservation.members?.email ? (
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <MailIcon fontSize="small" color="action" />
                                        <Typography variant="caption" color="textSecondary">
                                          {reservation.members.email}
                                        </Typography>
                                      </Box>
                                    ) : '—'}
                                  </TableCell>
                                  <TableCell>
                                    <Chip label={reservation.meal_type} size="small" color={getMealTypeColor(reservation.meal_type) as any} />
                                  </TableCell>
                                  <TableCell>
                                    {editingGuestCount?.id === reservation.id ? (
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <TextField
                                          type="number"
                                          size="small"
                                          value={editingGuestCount.value}
                                          onChange={e => setEditingGuestCount({ id: reservation.id, value: Math.max(1, Math.min(20, Number(e.target.value))) })}
                                          inputProps={{ min: 1, max: 20 }}
                                          sx={{ width: 64 }}
                                          autoFocus
                                        />
                                        <Button size="small" variant="contained" onClick={() => confirmAndUpdateGuestCount(reservation, editingGuestCount!.value)}>Save</Button>
                                        <Button size="small" onClick={() => setEditingGuestCount(null)}>Cancel</Button>
                                      </Box>
                                    ) : (
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        {reservation.guest_count}
                                        <IconButton size="small" onClick={() => setEditingGuestCount({ id: reservation.id, value: reservation.guest_count })}>
                                          <EditIcon sx={{ fontSize: 14 }} />
                                        </IconButton>
                                      </Box>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {editingNotes?.id === reservation.id ? (
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <TextField
                                          size="small"
                                          value={editingNotes.value}
                                          onChange={e => setEditingNotes({ id: reservation.id, value: e.target.value.slice(0, 256) })}
                                          inputProps={{ maxLength: 256 }}
                                          sx={{ width: 200 }}
                                          autoFocus
                                        />
                                        <Button size="small" variant="contained" onClick={() => handleUpdateNotes(reservation, editingNotes.value)}>Save</Button>
                                        <Button size="small" onClick={() => setEditingNotes(null)}>Cancel</Button>
                                      </Box>
                                    ) : (
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Typography variant="body2" sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                          {reservation.special_requests || reservation.table_preference || '—'}
                                        </Typography>
                                        <IconButton size="small" onClick={() => setEditingNotes({ id: reservation.id, value: reservation.special_requests || reservation.table_preference || '' })}>
                                          <EditIcon sx={{ fontSize: 14 }} />
                                        </IconButton>
                                      </Box>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Chip label={reservation.status} size="small" color={getStatusColor(reservation.status) as any} />
                                  </TableCell>
                                  <TableCell>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                      {reservation.status === 'pending' && (
                                        <IconButton size="small" color="success" onClick={() => confirmAndUpdateStatus(reservation, 'confirmed')} title="Confirm">
                                          <CheckCircleIcon fontSize="small" />
                                        </IconButton>
                                      )}
                                      {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                                        <IconButton size="small" color="error" onClick={() => confirmAndUpdateStatus(reservation, 'cancelled')} title="Cancel">
                                          <CancelIcon fontSize="small" />
                                        </IconButton>
                                      )}
                                      {reservation.status === 'cancelled' && (
                                        <IconButton size="small" color="warning" onClick={() => confirmAndUpdateStatus(reservation, 'pending')} title="Uncancel">
                                          <RestoreIcon fontSize="small" />
                                        </IconButton>
                                      )}
                                    </Box>
                                  </TableCell>
                                </TableRow>
                                {hasAudit && (
                                  <TableRow key={`${reservation.id}-audit`}>
                                    <TableCell colSpan={9} sx={{ py: 0, bgcolor: 'grey.50' }}>
                                      <Collapse in={isExpanded} unmountOnExit>
                                        <AuditLog entries={reservation.audit_log} />
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
                )}
              </Box>

              {/* Non-Member Bookings */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <MailIcon color="secondary" />
                  <Typography variant="h6">Non-Member Bookings ({nonMemberReservations.length})</Typography>
                </Box>
                {nonMemberReservations.length === 0 ? (
                  <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
                    No non-member bookings for this day
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell width={32} />
                          <TableCell>Time</TableCell>
                          <TableCell>Guest</TableCell>
                          <TableCell>Meal</TableCell>
                          <TableCell>Guests</TableCell>
                          <TableCell>Notes</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {nonMemberReservations
                          .sort((a, b) => a.reservation_time.localeCompare(b.reservation_time))
                          .map((reservation) => {
                            const isExpanded = expandedAuditRows.has(reservation.id)
                            const hasAudit = reservation.audit_log?.length > 0
                            return (
                              <>
                                <TableRow key={reservation.id} hover>
                                  <TableCell>
                                    {hasAudit && (
                                      <Tooltip title="View history">
                                        <IconButton size="small" onClick={() => toggleAuditRow(reservation.id)}>
                                          {isExpanded ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      {getMealTypeIcon(reservation.meal_type)}
                                      {formatTime(reservation.reservation_time)}
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" fontWeight={500}>{reservation.guest_name || '—'}</Typography>
                                    {reservation.guest_email ? (
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Typography variant="caption" color="textSecondary">{reservation.guest_email}</Typography>
                                        <IconButton size="small" onClick={() => handleCopyEmail(reservation.guest_email!)} title="Copy email">
                                          <ContentCopyIcon sx={{ fontSize: 12 }} />
                                        </IconButton>
                                      </Box>
                                    ) : (
                                      <Typography variant="caption" color="textSecondary">—</Typography>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Chip label={reservation.meal_type} size="small" color={getMealTypeColor(reservation.meal_type) as any} />
                                  </TableCell>
                                  <TableCell>
                                    {editingGuestCount?.id === reservation.id ? (
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <TextField
                                          type="number"
                                          size="small"
                                          value={editingGuestCount.value}
                                          onChange={e => setEditingGuestCount({ id: reservation.id, value: Math.max(1, Math.min(20, Number(e.target.value))) })}
                                          inputProps={{ min: 1, max: 20 }}
                                          sx={{ width: 64 }}
                                          autoFocus
                                        />
                                        <Button size="small" variant="contained" onClick={() => confirmAndUpdateGuestCount(reservation, editingGuestCount!.value)}>Save</Button>
                                        <Button size="small" onClick={() => setEditingGuestCount(null)}>Cancel</Button>
                                      </Box>
                                    ) : (
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        {reservation.guest_count}
                                        <IconButton size="small" onClick={() => setEditingGuestCount({ id: reservation.id, value: reservation.guest_count })}>
                                          <EditIcon sx={{ fontSize: 14 }} />
                                        </IconButton>
                                      </Box>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {editingNotes?.id === reservation.id ? (
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <TextField size="small" value={editingNotes.value}
                                          onChange={e => setEditingNotes({ id: reservation.id, value: e.target.value.slice(0, 256) })}
                                          inputProps={{ maxLength: 256 }} sx={{ width: 200 }} autoFocus />
                                        <Button size="small" variant="contained" onClick={() => handleUpdateNotes(reservation, editingNotes.value)}>Save</Button>
                                        <Button size="small" onClick={() => setEditingNotes(null)}>Cancel</Button>
                                      </Box>
                                    ) : (
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Typography variant="body2" sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                          {reservation.special_requests || reservation.table_preference || '—'}
                                        </Typography>
                                        <IconButton size="small" onClick={() => setEditingNotes({ id: reservation.id, value: reservation.special_requests || reservation.table_preference || '' })}>
                                          <EditIcon sx={{ fontSize: 14 }} />
                                        </IconButton>
                                      </Box>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Chip label={reservation.status} size="small" color={getStatusColor(reservation.status) as any} />
                                  </TableCell>
                                  <TableCell>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                      {reservation.status === 'pending' && (
                                        <IconButton size="small" color="success" onClick={() => confirmAndUpdateStatus(reservation, 'confirmed')} title="Confirm">
                                          <CheckCircleIcon fontSize="small" />
                                        </IconButton>
                                      )}
                                      {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                                        <IconButton size="small" color="error" onClick={() => confirmAndUpdateStatus(reservation, 'cancelled')} title="Cancel">
                                          <CancelIcon fontSize="small" />
                                        </IconButton>
                                      )}
                                      {reservation.status === 'cancelled' && (
                                        <IconButton size="small" color="warning" onClick={() => confirmAndUpdateStatus(reservation, 'pending')} title="Uncancel">
                                          <RestoreIcon fontSize="small" />
                                        </IconButton>
                                      )}
                                    </Box>
                                  </TableCell>
                                </TableRow>
                                {hasAudit && (
                                  <TableRow key={`${reservation.id}-audit`}>
                                    <TableCell colSpan={8} sx={{ py: 0, bgcolor: 'grey.50' }}>
                                      <Collapse in={isExpanded} unmountOnExit>
                                        <AuditLog entries={reservation.audit_log} />
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
                )}
              </Box>

              {/* Cancelled Bookings */}
              {cancelledReservations.length > 0 && (
                <Box sx={{ mt: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CancelIcon color="error" fontSize="small" />
                    <Typography variant="h6" color="error">Cancelled ({cancelledReservations.length})</Typography>
                  </Box>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell width={32} />
                          <TableCell>Time</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Meal</TableCell>
                          <TableCell>Guests</TableCell>
                          <TableCell>Notes</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {cancelledReservations
                          .sort((a, b) => a.reservation_time.localeCompare(b.reservation_time))
                          .map((reservation) => {
                            const isExpanded = expandedAuditRows.has(reservation.id)
                            const hasAudit = reservation.audit_log?.length > 0
                            return (
                              <>
                                <TableRow key={reservation.id} sx={{ opacity: 0.6 }}>
                                  <TableCell>
                                    {hasAudit && (
                                      <Tooltip title="View history">
                                        <IconButton size="small" onClick={() => toggleAuditRow(reservation.id)}>
                                          {isExpanded ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      {getMealTypeIcon(reservation.meal_type)}
                                      {formatTime(reservation.reservation_time)}
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2">
                                      {reservation.members?.full_name || reservation.guest_name || '—'}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="caption" color="textSecondary">
                                      {reservation.members?.email || reservation.guest_email || '—'}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Chip label={reservation.meal_type} size="small" color={getMealTypeColor(reservation.meal_type) as any} />
                                  </TableCell>
                                  <TableCell>{reservation.guest_count}</TableCell>
                                  <TableCell>
                                    {editingNotes?.id === reservation.id ? (
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <TextField
                                          size="small"
                                          value={editingNotes.value}
                                          onChange={e => setEditingNotes({ id: reservation.id, value: e.target.value.slice(0, 256) })}
                                          inputProps={{ maxLength: 256 }}
                                          sx={{ width: 200 }}
                                          autoFocus
                                        />
                                        <Button size="small" variant="contained" onClick={() => handleUpdateNotes(reservation, editingNotes.value)}>Save</Button>
                                        <Button size="small" onClick={() => setEditingNotes(null)}>Cancel</Button>
                                      </Box>
                                    ) : (
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Typography variant="body2" sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                          {reservation.special_requests || reservation.table_preference || '—'}
                                        </Typography>
                                        <IconButton size="small" onClick={() => setEditingNotes({ id: reservation.id, value: reservation.special_requests || reservation.table_preference || '' })}>
                                          <EditIcon sx={{ fontSize: 14 }} />
                                        </IconButton>
                                      </Box>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Button size="small" variant="outlined" color="warning" onClick={() => confirmAndUpdateStatus(reservation, 'pending')}>
                                      Uncancel
                                    </Button>
                                  </TableCell>
                                </TableRow>
                                {hasAudit && (
                                  <TableRow key={`${reservation.id}-audit`}>
                                    <TableCell colSpan={8} sx={{ py: 0, bgcolor: 'grey.50' }}>
                                      <Collapse in={isExpanded} unmountOnExit>
                                        <AuditLog entries={reservation.audit_log} />
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
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDayDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={!!pendingAction} onClose={() => setPendingAction(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          {pendingAction && (() => {
            const r = pendingAction.reservation
            const name = r.members?.full_name || r.guest_name || '—'
            const email = r.members?.email || r.guest_email || '—'
            const date = new Date(r.reservation_date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
            const time = formatTime(r.reservation_time)
            const currentNotes = r.special_requests || r.table_preference || null
            const actionLabel = pendingAction.type === 'guest_count'
              ? `Update guest count to ${pendingAction.newGuestCount}`
              : pendingAction.type === 'notes' ? 'Update notes'
              : pendingAction.newStatus === 'confirmed' ? 'Confirm reservation'
              : pendingAction.newStatus === 'cancelled' ? 'Cancel reservation'
              : 'Uncancel reservation'
            return (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                <Typography variant="body2"><strong>Action:</strong> {actionLabel}</Typography>
                <Typography variant="body2"><strong>Date:</strong> {date}</Typography>
                <Typography variant="body2"><strong>Time:</strong> {time}</Typography>
                <Typography variant="body2"><strong>Name:</strong> {name}</Typography>
                <Typography variant="body2"><strong>Email:</strong> {email}</Typography>
                <Typography variant="body2"><strong>Guests:</strong> {pendingAction.type === 'guest_count' ? `${r.guest_count} → ${pendingAction.newGuestCount}` : r.guest_count}</Typography>
                <Typography variant="body2"><strong>Notes:</strong> {pendingAction.type === 'notes' ? `${currentNotes || '(none)'} → ${pendingAction.newNotes || '(none)'}` : (currentNotes || '—')}</Typography>
              </Box>
            )
          })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingAction(null)}>Cancel</Button>
          <Button variant="contained" onClick={executePendingAction}>Confirm</Button>
        </DialogActions>
      </Dialog>

      {copiedEmail && (
        <Alert severity="success" sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }} onClose={() => setCopiedEmail(null)}>
          Email copied to clipboard!
        </Alert>
      )}

      {statusMessage && (
        <Alert severity="success" sx={{ position: 'fixed', bottom: copiedEmail ? 80 : 24, right: 24, zIndex: 9999 }} onClose={() => setStatusMessage(null)}>
          {statusMessage}
        </Alert>
      )}
    </Container>
  )
}
