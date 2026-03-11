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
  CircularProgress
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
import { useAuth } from '../context/AuthContext'
import { FUNCTIONS_URL } from '../services/supabase'

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
}

// Club opening days (Tuesday=2, Wednesday=3, Thursday=4, Friday=5)
const OPENING_DAYS = [2, 3, 4, 5]
const OPENING_DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const generateAvailableDates = () => {
  const dates = []
  const today = new Date()

  for (let i = 0; i < 30; i++) {
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

export default function DiningPage() {
  const { sessionToken } = useAuth()
  const [reservations, setReservations] = useState<DiningReservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [openDayDialog, setOpenDayDialog] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

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

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`${FUNCTIONS_URL}/admin-dining`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id, status })
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update status')
      }
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: status as DiningReservation['status'] } : r))
      setStatusMessage(`Reservation ${status}`)
      setTimeout(() => setStatusMessage(null), 3000)
    } catch (e: any) {
      setError(e.message)
    }
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
    const stats: Record<string, { totalBookings: number; totalGuests: number; breakfast: number; lunch: number }> = {}
    availableDates.forEach(({ date }) => {
      const dateReservations = reservationsByDate[date] || []
      stats[date] = {
        totalBookings: dateReservations.length,
        totalGuests: dateReservations.reduce((sum, r) => sum + r.guest_count, 0),
        breakfast: dateReservations.filter(r => r.meal_type === 'Breakfast').length,
        lunch: dateReservations.filter(r => r.meal_type === 'Lunch').length
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
  const memberReservations = selectedDateReservations.filter(r => r.member_id !== null)
  const nonMemberReservations = selectedDateReservations.filter(r => r.member_id === null)

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
                          <TableCell>Time</TableCell>
                          <TableCell>Member</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Meal</TableCell>
                          <TableCell>Guests</TableCell>
                          <TableCell>Table</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {memberReservations
                          .sort((a, b) => a.reservation_time.localeCompare(b.reservation_time))
                          .map((reservation) => (
                            <TableRow key={reservation.id} hover>
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
                                  <a href={`mailto:${reservation.members.email}`} style={{ textDecoration: 'none' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <MailIcon fontSize="small" color="action" />
                                      <Typography variant="caption" color="textSecondary">
                                        {reservation.members.email}
                                      </Typography>
                                    </Box>
                                  </a>
                                ) : '—'}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={reservation.meal_type}
                                  size="small"
                                  color={getMealTypeColor(reservation.meal_type) as any}
                                />
                              </TableCell>
                              <TableCell>{reservation.guest_count}</TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {reservation.table_preference || '—'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={reservation.status}
                                  size="small"
                                  color={getStatusColor(reservation.status) as any}
                                />
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  {reservation.status === 'pending' && (
                                    <IconButton size="small" color="success" onClick={() => handleUpdateStatus(reservation.id, 'confirmed')} title="Confirm">
                                      <CheckCircleIcon fontSize="small" />
                                    </IconButton>
                                  )}
                                  {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                                    <IconButton size="small" color="error" onClick={() => handleUpdateStatus(reservation.id, 'cancelled')} title="Cancel">
                                      <CancelIcon fontSize="small" />
                                    </IconButton>
                                  )}
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
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
                          <TableCell>Time</TableCell>
                          <TableCell>Guest</TableCell>
                          <TableCell>Meal</TableCell>
                          <TableCell>Guests</TableCell>
                          <TableCell>Special Requests</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {nonMemberReservations
                          .sort((a, b) => a.reservation_time.localeCompare(b.reservation_time))
                          .map((reservation) => (
                            <TableRow key={reservation.id} hover>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  {getMealTypeIcon(reservation.meal_type)}
                                  {formatTime(reservation.reservation_time)}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight={500}>{reservation.guest_name || '—'}</Typography>
                                {reservation.guest_email && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <a href={`mailto:${reservation.guest_email}`} style={{ textDecoration: 'none' }}>
                                      <Typography variant="caption" color="textSecondary">{reservation.guest_email}</Typography>
                                    </a>
                                    <IconButton size="small" onClick={() => handleCopyEmail(reservation.guest_email!)} title="Copy email">
                                      <ContentCopyIcon sx={{ fontSize: 12 }} />
                                    </IconButton>
                                  </Box>
                                )}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={reservation.meal_type}
                                  size="small"
                                  color={getMealTypeColor(reservation.meal_type) as any}
                                />
                              </TableCell>
                              <TableCell>{reservation.guest_count}</TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {reservation.special_requests || '—'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={reservation.status}
                                  size="small"
                                  color={getStatusColor(reservation.status) as any}
                                />
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  {reservation.status === 'pending' && (
                                    <IconButton size="small" color="success" onClick={() => handleUpdateStatus(reservation.id, 'confirmed')} title="Confirm">
                                      <CheckCircleIcon fontSize="small" />
                                    </IconButton>
                                  )}
                                  {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                                    <IconButton size="small" color="error" onClick={() => handleUpdateStatus(reservation.id, 'cancelled')} title="Cancel">
                                      <CancelIcon fontSize="small" />
                                    </IconButton>
                                  )}
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDayDialog}>Close</Button>
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
