import { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Divider
} from '@mui/material'
import BusinessIcon from '@mui/icons-material/Business'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import EventIcon from '@mui/icons-material/Event'
import PeopleIcon from '@mui/icons-material/People'
import { supabase, FUNCTIONS_URL } from '../services/supabase'
import { useAuth } from '../context/AuthContext'

const ADMIN_LOI_URL = `${FUNCTIONS_URL}/admin-loi`
const ADMIN_DASHBOARD_URL = `${FUNCTIONS_URL}/admin-dashboard`

interface LOIRequest {
  id: string
  member_name: string
  member_email: string
  club_name: string
  arrival_date: string
  departure_date: string
  purpose: string
  status: string
  created_at: string
}

interface DiningReservation {
  id: string
  meal_type: 'Breakfast' | 'Lunch'
  guest_count: number
  reservation_time: string
  status: string
  guest_name?: string | null
  guest_email?: string | null
  members?: { full_name: string; email: string } | null
}

interface TodayEvent {
  id: string
  title: string
  event_type: string
  price_per_person: number | null
  is_tba: boolean
  booking_count: number
  total_guests: number
}

export default function DashboardPage() {
  const { sessionToken } = useAuth()

  const [loiRequests, setLoiRequests] = useState<LOIRequest[]>([])
  const [loiLoading, setLoiLoading] = useState(true)
  const [newCount, setNewCount] = useState(0)

  const [todayDining, setTodayDining] = useState<DiningReservation[]>([])
  const [todayEvents, setTodayEvents] = useState<TodayEvent[]>([])
  const [todayLoading, setTodayLoading] = useState(true)

  const getToken = useCallback(() => sessionToken || localStorage.getItem('admin_token'), [sessionToken])

  const showNotification = useCallback((title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/vite.svg' })
    }
  }, [])

  const fetchLoiRequests = useCallback(async () => {
    try {
      const res = await fetch(ADMIN_LOI_URL, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const requests: LOIRequest[] = (data.requests || []).slice(0, 10).map((req: { id: string; members?: { full_name?: string; email?: string }; reciprocal_clubs?: { name?: string }; club_id: string; arrival_date: string; departure_date: string; purpose: string; status: string; created_at: string }) => ({
        id: req.id,
        member_name: req.members?.full_name || 'Unknown',
        member_email: req.members?.email || '',
        club_name: req.reciprocal_clubs?.name || req.club_id,
        arrival_date: req.arrival_date,
        departure_date: req.departure_date,
        purpose: req.purpose,
        status: req.status,
        created_at: req.created_at
      }))

      setLoiRequests(requests)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      setNewCount(requests.filter(r => new Date(r.created_at) > weekAgo).length)
    } catch (error) {
      console.error('Error fetching LOI requests:', error)
    } finally {
      setLoiLoading(false)
    }
  }, [getToken])

  const fetchTodayStats = useCallback(async () => {
    try {
      const res = await fetch(ADMIN_DASHBOARD_URL, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTodayDining(data.dining || [])
      setTodayEvents(data.events || [])
    } catch (error) {
      console.error('Error fetching today stats:', error)
    } finally {
      setTodayLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    fetchLoiRequests()
    fetchTodayStats()

    const loiChannel = supabase
      .channel('loi_requests_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'loi_requests' }, () => {
        fetchLoiRequests()
        showNotification('New LOI Request', 'A member submitted a Letter of Introduction request')
      })
      .subscribe()

    const diningChannel = supabase
      .channel('dining_reservations_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'dining_reservations' }, () => {
        fetchTodayStats()
        showNotification('New Dining Reservation', 'A new dining reservation was submitted')
      })
      .subscribe()

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => {
      supabase.removeChannel(loiChannel)
      supabase.removeChannel(diningChannel)
    }
  }, [fetchLoiRequests, fetchTodayStats, showNotification])

  const handleApprove = async (id: string) => {
    await fetch(ADMIN_LOI_URL, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify({ id, status: 'approved' })
    })
    fetchLoiRequests()
  }

  const handleReject = async (id: string) => {
    await fetch(ADMIN_LOI_URL, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify({ id, status: 'rejected' })
    })
    fetchLoiRequests()
  }

  const todayStr = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
  const totalDiningGuests = todayDining.reduce((sum, r) => sum + r.guest_count, 0)
  const breakfastCount = todayDining.filter(r => r.meal_type === 'Breakfast').length
  const lunchCount = todayDining.filter(r => r.meal_type === 'Lunch').length

  const formatTime = (t: string) => {
    const [h, m] = t.split(':')
    const hour = parseInt(h)
    return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
  }

  const eventTypeLabel = (type: string) => {
    const map: Record<string, string> = { lunch: 'Lunch', dinner: 'Dinner', lunch_dinner: 'Lunch & Dinner', meeting: 'Meeting', special: 'Special' }
    return map[type] || type
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>Overview of club activity</Typography>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <BusinessIcon color="primary" sx={{ fontSize: 32 }} />
                <Typography variant="h6">LOI Requests</Typography>
              </Box>
              <Typography variant="h3" sx={{ mb: 1 }}>{loiLoading ? '—' : loiRequests.length}</Typography>
              <Typography variant="body2" color="textSecondary">Total requests</Typography>
              {newCount > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Chip label={`${newCount} new this week`} color="error" size="small" sx={{ fontWeight: 'bold' }} />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <RestaurantIcon color="primary" sx={{ fontSize: 32 }} />
                <Typography variant="h6">Dining Today</Typography>
              </Box>
              <Typography variant="h3" sx={{ mb: 1 }}>{todayLoading ? '—' : todayDining.length}</Typography>
              <Typography variant="body2" color="textSecondary">{totalDiningGuests} guests total</Typography>
              {!todayLoading && todayDining.length > 0 && (
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  {breakfastCount > 0 && <Chip label={`${breakfastCount} breakfast`} size="small" variant="outlined" />}
                  {lunchCount > 0 && <Chip label={`${lunchCount} lunch`} size="small" color="primary" variant="outlined" />}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <EventIcon color="primary" sx={{ fontSize: 32 }} />
                <Typography variant="h6">Events Today</Typography>
              </Box>
              <Typography variant="h3" sx={{ mb: 1 }}>{todayLoading ? '—' : todayEvents.length}</Typography>
              <Typography variant="body2" color="textSecondary">
                {todayEvents.reduce((s, e) => s + e.total_guests, 0)} guests booked
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Today's Activity */}
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>Today — {todayStr}</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <RestaurantIcon fontSize="small" color="action" />
                <Typography variant="h6">Dining Reservations</Typography>
              </Box>
              {todayLoading ? (
                <Typography color="textSecondary">Loading...</Typography>
              ) : todayDining.length === 0 ? (
                <Typography color="textSecondary" variant="body2">No dining reservations today</Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Time</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Meal</TableCell>
                        <TableCell>Guests</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {todayDining.map(r => (
                        <TableRow key={r.id} hover>
                          <TableCell>{formatTime(r.reservation_time)}</TableCell>
                          <TableCell>
                            <Typography variant="body2">{r.members?.full_name || r.guest_name || '—'}</Typography>
                            <Typography variant="caption" color="textSecondary">{r.members?.email || r.guest_email || ''}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={r.meal_type} size="small" color={r.meal_type === 'Lunch' ? 'primary' : 'default'} />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <PeopleIcon fontSize="small" color="action" />
                              {r.guest_count}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={r.status}
                              size="small"
                              color={r.status === 'confirmed' ? 'success' : r.status === 'cancelled' ? 'error' : 'warning'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <EventIcon fontSize="small" color="action" />
                <Typography variant="h6">Events</Typography>
              </Box>
              {todayLoading ? (
                <Typography color="textSecondary">Loading...</Typography>
              ) : todayEvents.length === 0 ? (
                <Typography color="textSecondary" variant="body2">No events today</Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {todayEvents.map(event => (
                    <Box key={event.id}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1, mr: 1 }}>
                          <Typography variant="body1" fontWeight={500}>{event.title}</Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                            <Chip label={eventTypeLabel(event.event_type)} size="small" variant="outlined" />
                            {event.price_per_person && <Chip label={`£${event.price_per_person}`} size="small" variant="outlined" />}
                            {event.is_tba && <Chip label="TBA" size="small" color="warning" />}
                          </Box>
                        </Box>
                        <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                          <Typography variant="h6" color="primary">{event.booking_count}</Typography>
                          <Typography variant="caption" color="textSecondary">bookings</Typography>
                          <br />
                          <Typography variant="caption" color="textSecondary">{event.total_guests} guests</Typography>
                        </Box>
                      </Box>
                      <Divider sx={{ mt: 2 }} />
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent LOI Requests */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Recent LOI Requests</Typography>
          {loiLoading ? (
            <Typography color="textSecondary">Loading...</Typography>
          ) : loiRequests.length === 0 ? (
            <Typography color="textSecondary">No LOI requests yet</Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Member</TableCell>
                    <TableCell>Club</TableCell>
                    <TableCell>Arrival</TableCell>
                    <TableCell>Departure</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loiRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>
                        <Typography variant="body2">{req.member_name}</Typography>
                        <Typography variant="caption" color="textSecondary">{req.member_email}</Typography>
                      </TableCell>
                      <TableCell>{req.club_name}</TableCell>
                      <TableCell>{req.arrival_date}</TableCell>
                      <TableCell>{req.departure_date}</TableCell>
                      <TableCell>
                        <Chip
                          label={req.status}
                          size="small"
                          color={req.status === 'approved' ? 'success' : req.status === 'rejected' ? 'error' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>
                        {req.status === 'pending' && (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button size="small" color="success" onClick={() => handleApprove(req.id)}>Approve</Button>
                            <Button size="small" color="error" onClick={() => handleReject(req.id)}>Reject</Button>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Container>
  )
}
