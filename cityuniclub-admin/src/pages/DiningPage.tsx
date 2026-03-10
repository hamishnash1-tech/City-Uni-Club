import { useState, useMemo } from 'react'
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
  Alert
} from '@mui/material'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import CoffeeIcon from '@mui/icons-material/Coffee'
import LunchDiningIcon from '@mui/icons-material/LunchDining'
import PeopleIcon from '@mui/icons-material/People'
import MailIcon from '@mui/icons-material/Mail'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CloseIcon from '@mui/icons-material/Close'
import PersonIcon from '@mui/icons-material/Person'

interface DiningReservation {
  id: string
  member_id: string | null
  member_name?: string
  member_email?: string
  guest_name: string
  guest_email?: string
  guest_count: number
  reservation_date: string
  reservation_time: string
  meal_type: 'breakfast' | 'lunch'
  table_preference?: string
  special_requests?: string
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at: string
}

// Club opening days (Tuesday=2, Wednesday=3, Thursday=4, Friday=5)
const OPENING_DAYS = [2, 3, 4, 5]
const OPENING_DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Generate next 30 days of available dates
const generateAvailableDates = () => {
  const dates = []
  const today = new Date()
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    
    // Only include Tuesday-Friday
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

// Mock reservations data
const mockReservations: DiningReservation[] = [
  {
    id: 'r1',
    member_id: 'stephen@example.com',
    member_name: 'Stephen Rayner',
    member_email: 'stephen@example.com',
    guest_name: 'Stephen Rayner',
    guest_email: 'stephen@example.com',
    guest_count: 2,
    reservation_date: new Date().toISOString().split('T')[0],
    reservation_time: '12:30',
    meal_type: 'lunch',
    status: 'confirmed',
    created_at: '2025-03-01',
    special_requests: 'Window table preferred'
  },
  {
    id: 'r2',
    member_id: 'john@example.com',
    member_name: 'John Smith',
    member_email: 'john@example.com',
    guest_name: 'John Smith',
    guest_email: 'john@example.com',
    guest_count: 1,
    reservation_date: new Date().toISOString().split('T')[0],
    reservation_time: '09:00',
    meal_type: 'breakfast',
    status: 'confirmed',
    created_at: '2025-03-02'
  },
  {
    id: 'r3',
    member_id: null,
    guest_name: 'Alice Johnson',
    guest_email: 'alice.johnson@gmail.com',
    guest_count: 4,
    reservation_date: new Date().toISOString().split('T')[0],
    reservation_time: '13:00',
    meal_type: 'lunch',
    status: 'pending',
    created_at: '2025-03-03',
    special_requests: 'Vegetarian options needed'
  },
  {
    id: 'r4',
    member_id: null,
    guest_name: 'Bob Williams',
    guest_email: 'bob.williams@yahoo.com',
    guest_count: 2,
    reservation_date: new Date().toISOString().split('T')[0],
    reservation_time: '12:00',
    meal_type: 'lunch',
    status: 'confirmed',
    created_at: '2025-03-04'
  }
]

export default function DiningPage() {
  const [reservations] = useState<DiningReservation[]>(mockReservations)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [openDayDialog, setOpenDayDialog] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)

  const availableDates = useMemo(() => generateAvailableDates(), [])

  // Group reservations by date
  const reservationsByDate = useMemo(() => {
    const grouped: Record<string, DiningReservation[]> = {}
    
    reservations.forEach(res => {
      if (!grouped[res.reservation_date]) {
        grouped[res.reservation_date] = []
      }
      grouped[res.reservation_date].push(res)
    })
    
    return grouped
  }, [reservations])

  // Calculate stats for each date
  const dateStats = useMemo(() => {
    const stats: Record<string, { totalBookings: number; totalGuests: number; breakfast: number; lunch: number }> = {}
    
    availableDates.forEach(({ date }) => {
      const dateReservations = reservationsByDate[date] || []
      stats[date] = {
        totalBookings: dateReservations.length,
        totalGuests: dateReservations.reduce((sum, r) => sum + r.guest_count, 0),
        breakfast: dateReservations.filter(r => r.meal_type === 'breakfast').length,
        lunch: dateReservations.filter(r => r.meal_type === 'lunch').length
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
    return type === 'breakfast' ? <CoffeeIcon fontSize="small" /> : <LunchDiningIcon fontSize="small" />
  }

  const getMealTypeLabel = (type: string) => {
    return type === 'breakfast' ? 'Breakfast' : 'Lunch'
  }

  const getMealTypeColor = (type: string) => {
    return type === 'breakfast' ? 'default' : 'primary'
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
  
  // Separate members and non-members
  const memberReservations = selectedDateReservations.filter(r => r.member_id !== null)
  const nonMemberReservations = selectedDateReservations.filter(r => r.member_id === null)

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dining Reservations
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Club open Tuesday - Friday | Breakfast: 8:00-11:00 | Lunch: 12:00-14:30
        </Typography>
      </Box>

      {/* Available Dates Grid */}
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

      {/* Day Detail Dialog */}
      <Dialog
        open={openDayDialog}
        onClose={handleCloseDayDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">
                {selectedDateInfo?.dayName}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {selectedDateInfo?.fullDate}
              </Typography>
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
              {/* Member Bookings Section */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <PersonIcon color="primary" />
                  <Typography variant="h6">
                    Member Bookings ({memberReservations.length})
                  </Typography>
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
                                  {reservation.member_name}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {reservation.member_email ? (
                                  <a href={`mailto:${reservation.member_email}`} style={{ textDecoration: 'none' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <MailIcon fontSize="small" color="action" />
                                      <Typography variant="caption" color="textSecondary">
                                        {reservation.member_email}
                                      </Typography>
                                    </Box>
                                  </a>
                                ) : (
                                  '-'
                                )}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={getMealTypeLabel(reservation.meal_type)}
                                  size="small"
                                  color={getMealTypeColor(reservation.meal_type)}
                                />
                              </TableCell>
                              <TableCell>{reservation.guest_count}</TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {reservation.table_preference || '-'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={reservation.status}
                                  size="small"
                                  color={reservation.status === 'confirmed' ? 'success' : 'warning'}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>

              {/* Non-Member Bookings Section */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <MailIcon color="secondary" />
                  <Typography variant="h6">
                    Non-Member Bookings ({nonMemberReservations.length})
                  </Typography>
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
                          <TableCell>Email</TableCell>
                          <TableCell>Meal</TableCell>
                          <TableCell>Guests</TableCell>
                          <TableCell>Special Requests</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Copy Email</TableCell>
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
                                <Typography variant="body2" fontWeight={500}>
                                  {reservation.guest_name}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {reservation.guest_email ? (
                                  <a href={`mailto:${reservation.guest_email}`} style={{ textDecoration: 'none' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <MailIcon fontSize="small" color="action" />
                                      <Typography variant="caption" color="textSecondary">
                                        {reservation.guest_email}
                                      </Typography>
                                    </Box>
                                  </a>
                                ) : (
                                  '-'
                                )}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={getMealTypeLabel(reservation.meal_type)}
                                  size="small"
                                  color={getMealTypeColor(reservation.meal_type)}
                                />
                              </TableCell>
                              <TableCell>{reservation.guest_count}</TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {reservation.special_requests || '-'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={reservation.status}
                                  size="small"
                                  color={reservation.status === 'confirmed' ? 'success' : 'warning'}
                                />
                              </TableCell>
                              <TableCell>
                                {reservation.guest_email && (
                                  <IconButton
                                    size="small"
                                    onClick={() => handleCopyEmail(reservation.guest_email!)}
                                    title="Copy email address"
                                  >
                                    <ContentCopyIcon fontSize="small" />
                                  </IconButton>
                                )}
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

      {/* Toast notification for copied email */}
      {copiedEmail && (
        <Alert
          severity="success"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999
          }}
          onClose={() => setCopiedEmail(null)}
        >
          Email copied to clipboard!
        </Alert>
      )}
    </Container>
  )
}
