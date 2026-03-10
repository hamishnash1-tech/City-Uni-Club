import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import membersData from '../data/members.json'
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteIcon from '@mui/icons-material/Delete'
import PeopleIcon from '@mui/icons-material/People'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import EventIcon from '@mui/icons-material/Event'

interface Booking {
  id: string
  member_id: string | null
  member_name?: string
  member_email?: string
  guest_name: string
  guest_email?: string
  guest_count: number
  meal_option?: string
  special_requests?: string
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at: string
  is_member: boolean
}

interface EventDetails {
  id: string
  title: string
  event_date: string
  event_end_date?: string | null
  event_type: string
  description?: string | null
  price?: number | null
}

// Mock events data
const mockEvents: Record<string, EventDetails> = {
  '1': { id: '1', title: "St Patrick's Day Lunch", event_date: '2025-03-17', event_type: 'lunch', price: 32 },
  '2': { id: '2', title: 'Moules Frites Lunch', event_date: '2025-03-25', event_type: 'lunch', price: 34 },
  '3': { id: '3', title: "Younger Members Dinner", event_date: '2025-03-26', event_type: 'dinner', price: 45 },
  '4': { id: '4', title: '4 Course French Tasting Menu with Paired Wines', event_date: '2025-04-30', event_type: 'dinner', price: null },
  '5': { id: '5', title: 'New Member Candidates Meeting', event_date: '2025-04-30', event_type: 'meeting', price: null },
  '6': { id: '6', title: 'Sea Food Lunch', event_date: '2025-04-30', event_type: 'lunch', price: null },
  '7': { id: '7', title: 'Literary Lunch - The Second Curtain by Roy Fuller', event_date: '2025-04-17', event_type: 'lunch', price: 46 },
  '8': { id: '8', title: "St George's Day Lunch and Dinner", event_date: '2025-04-23', event_end_date: null, event_type: 'lunch_dinner', price: 48 },
  '9': { id: '9', title: "Younger Members Dinner", event_date: '2025-04-30', event_type: 'dinner', price: 45 },
  '10': { id: '10', title: 'Steak and Kidney Lunch', event_date: '2025-05-13', event_end_date: '2025-05-14', event_type: 'lunch', price: null },
  '11': { id: '11', title: 'Moules Frites', event_date: '2025-05-27', event_end_date: '2025-05-28', event_type: 'lunch', price: null },
  '12': { id: '12', title: 'Royal Ascot Tent', event_date: '2025-06-17', event_type: 'special', price: 320 }
}

// Mock bookings data
const mockBookings: Record<string, Booking[]> = {
  '1': [
    { id: 'b1', member_id: 'stephen@example.com', member_name: 'Stephen Rayner', member_email: 'stephen@example.com', guest_name: 'Stephen Rayner', guest_email: 'stephen@example.com', guest_count: 2, meal_option: 'lunch', status: 'confirmed', created_at: '2025-03-01', is_member: true },
    { id: 'b2', member_id: 'john@example.com', member_name: 'John Smith', member_email: 'john@example.com', guest_name: 'John Smith', guest_email: 'john@example.com', guest_count: 1, meal_option: 'lunch', status: 'confirmed', created_at: '2025-03-02', is_member: true },
    { id: 'b3', member_id: null, guest_name: 'Alice Johnson', guest_email: 'alice.johnson@gmail.com', guest_count: 2, meal_option: 'lunch', status: 'confirmed', created_at: '2025-03-04', is_member: false },
    { id: 'b4', member_id: null, guest_name: 'Bob Williams', guest_email: 'bob.williams@yahoo.com', guest_count: 1, meal_option: 'lunch', status: 'pending', created_at: '2025-03-05', is_member: false, special_requests: 'Wheelchair access' },
  ],
  '10': [
    { id: 'b5', member_id: 'jane@example.com', member_name: 'Jane Doe', member_email: 'jane@example.com', guest_name: 'Jane Doe', guest_email: 'jane@example.com', guest_count: 3, meal_option: 'lunch', status: 'confirmed', created_at: '2025-03-03', is_member: true, special_requests: 'Gluten free' },
  ]
}

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const [event, setEvent] = useState<EventDetails | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [selectedMember, setSelectedMember] = useState<{ id: string; name: string; email: string } | null>(null)
  const [guestCount, setGuestCount] = useState(1)
  const [mealOption, setMealOption] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')

  // Prepare members list for autocomplete
  const membersList = membersData.map((m: any) => ({
    id: m.id,
    name: m.name,
    email: m.email
  }))

  useEffect(() => {
    if (eventId) {
      loadEventData()
      loadBookings()
    }
  }, [eventId])

  const loadEventData = () => {
    if (!eventId) return
    
    const eventData = mockEvents[eventId as keyof typeof mockEvents]
    if (eventData) {
      setEvent(eventData)
    } else {
      setError('Event not found')
    }
    setLoading(false)
  }

  const loadBookings = () => {
    if (!eventId) return

    const eventBookings = mockBookings[eventId] || []
    setBookings(eventBookings)
  }

  const handleAddBooking = () => {
    if (!eventId) return

    const newBooking: Booking = {
      id: `b${Date.now()}`,
      member_id: selectedMember?.email || null,
      member_name: selectedMember?.name,
      member_email: selectedMember?.email,
      guest_name: selectedMember?.name || 'Guest',
      guest_email: selectedMember?.email,
      guest_count: guestCount,
      meal_option: mealOption || undefined,
      special_requests: specialRequests || undefined,
      status: 'pending',
      created_at: new Date().toISOString(),
      is_member: !!selectedMember
    }

    setBookings([newBooking, ...bookings])
    setSuccess('Booking added successfully')
    setOpenAddDialog(false)
    resetForm()
  }

  const handleDeleteBooking = (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    setBookings(bookings.filter(b => b.id !== bookingId))
    setSuccess('Booking cancelled')
  }

  const resetForm = () => {
    setSelectedMember(null)
    setGuestCount(1)
    setMealOption('')
    setSpecialRequests('')
  }

  const memberBookings = bookings.filter(b => b.is_member)
  const nonMemberBookings = bookings.filter(b => !b.is_member)

  const totalMemberTickets = memberBookings.reduce((sum, b) => sum + b.guest_count, 0)
  const totalNonMemberTickets = nonMemberBookings.reduce((sum, b) => sum + b.guest_count, 0)
  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + ((event?.price || 0) * b.guest_count), 0)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateRange = () => {
    if (!event) return ''
    
    if (event.event_end_date) {
      const startDate = new Date(event.event_date)
      const endDate = new Date(event.event_end_date)
      
      if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
        return `${startDate.toLocaleDateString('en-GB', { day: 'numeric' })}-${endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
      }
      
      return `${formatDate(event.event_date)} - ${formatDate(event.event_end_date)}`
    }
    
    return formatDate(event.event_date)
  }

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      lunch: 'Lunch',
      dinner: 'Dinner',
      lunch_dinner: 'Lunch & Dinner',
      meeting: 'Meeting',
      special: 'Special Event'
    }
    return labels[type] || type
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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Typography>Loading...</Typography>
      </Container>
    )
  }

  if (!event) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Event not found</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/events')} sx={{ mt: 2 }}>
          Back to Events
        </Button>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/events')}>
          Back to Events
        </Button>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setOpenAddDialog(true)}
        >
          Add Booking
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

      {/* Event Details Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h4" gutterBottom>
              {event.title}
            </Typography>
            <Chip
              label={getEventTypeLabel(event.event_type)}
              color={getEventTypeColor(event.event_type)}
            />
          </Box>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventIcon color="action" />
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Date
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {formatDateRange()}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {event.price !== null && (
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachMoneyIcon color="action" />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Price
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      £{event.price}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PeopleIcon color="action" />
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Total RSVPs
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {totalMemberTickets + totalNonMemberTickets} tickets
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachMoneyIcon color="success" />
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Revenue
                  </Typography>
                  <Typography variant="body1" fontWeight={500} color="success.main">
                    £{totalRevenue}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Member Bookings */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Member Bookings ({memberBookings.length} bookings, {totalMemberTickets} tickets)
      </Typography>

      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Member Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Tickets</TableCell>
              <TableCell>Meal Option</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Special Requests</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {memberBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="textSecondary" sx={{ py: 2 }}>
                    No member bookings yet
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              memberBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.member_name || booking.guest_name}</TableCell>
                  <TableCell>
                    {booking.member_email ? (
                      <a href={`mailto:${booking.member_email}`}>
                        {booking.member_email}
                      </a>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{booking.guest_count}</TableCell>
                  <TableCell>
                    {booking.meal_option ? (
                      <Chip label={booking.meal_option} size="small" />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={booking.status}
                      size="small"
                      color={booking.status === 'confirmed' ? 'success' : 'warning'}
                    />
                  </TableCell>
                  <TableCell>{booking.special_requests || '-'}</TableCell>
                  <TableCell>
                    <IconButton size="small" color="error" onClick={() => handleDeleteBooking(booking.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Non-Member Bookings */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Non-Member Bookings ({nonMemberBookings.length} bookings, {totalNonMemberTickets} tickets)
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Guest Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Tickets</TableCell>
              <TableCell>Meal Option</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Special Requests</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {nonMemberBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="textSecondary" sx={{ py: 2 }}>
                    No non-member bookings yet
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              nonMemberBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.guest_name}</TableCell>
                  <TableCell>
                    {booking.guest_email ? (
                      <a href={`mailto:${booking.guest_email}`}>
                        {booking.guest_email}
                      </a>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{booking.guest_count}</TableCell>
                  <TableCell>
                    {booking.meal_option ? (
                      <Chip label={booking.meal_option} size="small" />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={booking.status}
                      size="small"
                      color={booking.status === 'confirmed' ? 'success' : 'warning'}
                    />
                  </TableCell>
                  <TableCell>{booking.special_requests || '-'}</TableCell>
                  <TableCell>
                    <IconButton size="small" color="error" onClick={() => handleDeleteBooking(booking.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Booking Dialog */}
      <Dialog open={openAddDialog} onClose={() => { setOpenAddDialog(false); resetForm() }} maxWidth="sm" fullWidth>
        <DialogTitle>Add Booking for {event.title}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <Autocomplete
              options={membersList}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField {...params} label="Select Member (optional)" />
              )}
              value={selectedMember}
              onChange={(_, newValue) => setSelectedMember(newValue)}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box>
                    <Typography variant="body2">{option.name}</Typography>
                    <Typography variant="caption" color="textSecondary">{option.email}</Typography>
                  </Box>
                </Box>
              )}
            />

            <TextField
              fullWidth
              label="Guest Name (if not member)"
              value={selectedMember?.name || ''}
              disabled={!!selectedMember}
            />

            <TextField
              fullWidth
              label="Number of Tickets"
              type="number"
              value={guestCount}
              onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
              inputProps={{ min: 1, max: 10 }}
            />

            {(event.event_type === 'lunch' || event.event_type === 'dinner' || event.event_type === 'lunch_dinner') && (
              <TextField
                fullWidth
                select
                label="Meal Option"
                value={mealOption}
                onChange={(e) => setMealOption(e.target.value)}
                SelectProps={{ native: true }}
              >
                <option value="">Select...</option>
                {event.event_type === 'lunch_dinner' ? (
                  <>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                  </>
                ) : (
                  <option value={event.event_type}>{getEventTypeLabel(event.event_type)}</option>
                )}
              </TextField>
            )}

            <TextField
              fullWidth
              label="Special Requests"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              multiline
              rows={3}
              placeholder="Dietary requirements, accessibility needs, etc."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenAddDialog(false); resetForm() }}>Cancel</Button>
          <Button onClick={handleAddBooking} variant="contained">
            Add Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
