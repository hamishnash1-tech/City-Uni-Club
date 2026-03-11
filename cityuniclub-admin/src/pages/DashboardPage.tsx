import { useState, useEffect } from 'react'
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
  Button
} from '@mui/material'
import BusinessIcon from '@mui/icons-material/Business'
import { supabase, FUNCTIONS_URL } from '../services/supabase'
import { useAuth } from '../context/AuthContext'

const ADMIN_LOI_URL = `${FUNCTIONS_URL}/admin-loi`

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

export default function DashboardPage() {
  const { sessionToken } = useAuth()
  const [loiRequests, setLoiRequests] = useState<LOIRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [newCount, setNewCount] = useState(0)

  useEffect(() => {
    fetchLoiRequests()

    // Set up realtime subscription for new LOI requests
    const channel = supabase
      .channel('loi_requests_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'loi_requests'
        },
        (payload) => {
          console.log('🔔 New LOI request received!', payload)
          // Refresh the list when new request arrives
          fetchLoiRequests()
          // Show browser notification if supported
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('New LOI Request', {
              body: `New Letter of Introduction request submitted`,
              icon: '/vite.svg'
            })
          }
        }
      )
      .subscribe()

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchLoiRequests = async () => {
    try {
      const res = await fetch(ADMIN_LOI_URL, {
        headers: { 'Authorization': `Bearer ${sessionToken}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const requests: LOIRequest[] = (data.requests || []).slice(0, 10).map((req: any) => ({
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
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    await fetch(ADMIN_LOI_URL, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionToken}` },
      body: JSON.stringify({ id, status: 'approved' })
    })
    fetchLoiRequests()
  }

  const handleReject = async (id: string) => {
    await fetch(ADMIN_LOI_URL, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionToken}` },
      body: JSON.stringify({ id, status: 'rejected' })
    })
    fetchLoiRequests()
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
        Overview of club activity
      </Typography>

      <Grid container spacing={3}>
        {/* LOI Requests Card */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              height: '100%',
              position: 'relative'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <BusinessIcon color="primary" sx={{ fontSize: 32 }} />
                <Typography variant="h6">LOI Requests</Typography>
              </Box>

              <Typography variant="h3" sx={{ mb: 1 }}>
                {loading ? '-' : loiRequests.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total requests
              </Typography>

              {newCount > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={`${newCount} new`}
                    color="error"
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* LOI Requests Table */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent LOI Requests
          </Typography>
          
          {loading ? (
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
                        <Typography variant="caption" color="textSecondary">
                          {req.member_email}
                        </Typography>
                      </TableCell>
                      <TableCell>{req.club_name}</TableCell>
                      <TableCell>{req.arrival_date}</TableCell>
                      <TableCell>{req.departure_date}</TableCell>
                      <TableCell>
                        <Chip
                          label={req.status}
                          size="small"
                          color={
                            req.status === 'approved' ? 'success' :
                            req.status === 'rejected' ? 'error' :
                            'warning'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {req.status === 'pending' && (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              color="success"
                              onClick={() => handleApprove(req.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => handleReject(req.id)}
                            >
                              Reject
                            </Button>
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
