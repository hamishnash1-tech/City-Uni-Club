import { useState, useMemo, useEffect } from 'react'
import membersData from '../data/members.json'
import { useAuth } from '../context/AuthContext'
import { FUNCTIONS_URL } from '../services/supabase'

const ADMIN_LOI_URL = `${FUNCTIONS_URL}/admin-loi`
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Card,
  CardContent,
  IconButton,
  Alert,
  Autocomplete,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import BusinessIcon from '@mui/icons-material/Business'
import MailIcon from '@mui/icons-material/Mail'
import SendIcon from '@mui/icons-material/Send'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PendingIcon from '@mui/icons-material/Pending'

interface LoiRequest {
  id: string
  member_id: string
  member_name: string
  member_email: string
  club_id: string
  club_name: string
  club_location: string
  club_region: string
  club_email: string
  arrival_date: string
  departure_date?: string
  purpose: string
  status: 'pending' | 'approved' | 'rejected' | 'sent'
  special_requests?: string
  created_at: string
}

// Reciprocal clubs data - sample clubs with emails
const reciprocalClubs = [
  { id: '1', name: "Buck's Club", location: 'London', country: 'United Kingdom', region: 'United Kingdom', email: 'info@bucksclub.co.uk' },
  { id: '2', name: 'Oxford and Cambridge Club', location: 'London', country: 'United Kingdom', region: 'United Kingdom', email: 'admin@oxfordandcambridgeclub.co.uk' },
  { id: '3', name: 'Royal Over-Seas League', location: 'London', country: 'United Kingdom', region: 'United Kingdom', email: 'info@rosl.co.uk' },
  { id: '4', name: 'The Melbourne Club', location: 'Melbourne', country: 'Australia', region: 'Australia', email: 'admin@melbourneclub.com.au' },
  { id: '5', name: 'The Australian Club', location: 'Sydney', country: 'Australia', region: 'Australia', email: 'info@theaustralianclub.com' },
  { id: '6', name: 'The National Club', location: 'Toronto', country: 'Canada', region: 'Canada', email: 'info@thenationalclub.com' },
  { id: '7', name: 'The University Club', location: 'New York', country: 'USA', region: 'USA', email: 'info@universityclub.org' },
  { id: '8', name: 'The Metropolitan Club', location: 'Washington DC', country: 'USA', region: 'USA', email: 'info@metclub.org' },
  { id: '9', name: 'Cercle de Lorraine', location: 'Brussels', country: 'Belgium', region: 'Europe', email: 'info@cerclelorraine.be' },
  { id: '10', name: 'The Athens Club', location: 'Athens', country: 'Greece', region: 'Europe', email: 'info@athensclub.gr' },
  { id: '11', name: 'The Hong Kong Club', location: 'Hong Kong', country: 'Hong Kong', region: 'Asia', email: 'info@hkclub.com.hk' },
  { id: '12', name: 'Singapore Cricket Club', location: 'Singapore', country: 'Singapore', region: 'Asia', email: 'info@singaporecricket.com' },
]

export default function LoiPage() {
  const { sessionToken } = useAuth()
  const [requests, setRequests] = useState<LoiRequest[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [openDialog, setOpenDialog] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequests()
  }, [])

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${sessionToken}`
  }

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const res = await fetch(ADMIN_LOI_URL, { headers: authHeaders })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch')
      setRequests((data.requests || []).map((r: any) => ({
        id: r.id,
        member_id: r.member_id,
        member_name: r.members?.full_name || 'Unknown',
        member_email: r.members?.email || '',
        club_id: r.club_id,
        club_name: r.reciprocal_clubs?.name || 'Unknown',
        club_location: r.reciprocal_clubs?.location || '',
        club_region: r.reciprocal_clubs?.region || '',
        club_email: r.reciprocal_clubs?.contact_email || '',
        arrival_date: r.arrival_date,
        departure_date: r.departure_date,
        purpose: r.purpose,
        status: r.status,
        created_at: r.created_at,
      })))
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  // Form state
  const [formData, setFormData] = useState({
    member_id: '',
    club_id: '',
    arrival_date: '',
    departure_date: '',
    purpose: '',
    special_requests: ''
  })

  const membersList = useMemo(() => membersData.map((m: any) => ({
    id: m.id,
    name: m.name,
    email: m.email
  })), [])

  // Filter requests
  const filteredRequests = useMemo(() => {
    let filtered = requests
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(r =>
        r.member_name.toLowerCase().includes(term) ||
        r.member_email?.toLowerCase().includes(term) ||
        r.club_name.toLowerCase().includes(term)
      )
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter)
    }
    
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [requests, searchTerm, statusFilter])

  // Stats
  const stats = useMemo(() => {
    const total = requests.length
    const pending = requests.filter(r => r.status === 'pending').length
    const sent = requests.filter(r => r.status === 'sent').length
    const approved = requests.filter(r => r.status === 'approved').length
    
    return { total, pending, sent, approved }
  }, [requests])

  const handleOpenDialog = () => {
    setFormData({
      member_id: '',
      club_id: '',
      arrival_date: '',
      departure_date: '',
      purpose: '',
      special_requests: ''
    })
    setActiveStep(0)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setActiveStep(0)
  }

  const handleNext = () => {
    setActiveStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
  }

  const handleSubmit = async () => {
    setError('')
    setSuccess('')
    setSending(true)

    try {
      const selectedMember = membersList.find(m => m.id === formData.member_id)
      const selectedClub = reciprocalClubs.find(c => c.id === formData.club_id)

      if (!selectedMember || !selectedClub) {
        throw new Error('Please select member and club')
      }

      // Send LOI email via Resend
      const response = await fetch('https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1/send-loi-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clubName: selectedClub.name,
          clubLocation: selectedClub.location,
          memberName: selectedMember.name,
          memberEmail: selectedMember.email,
          arrivalDate: formData.arrival_date,
          departureDate: formData.departure_date,
          purpose: formData.purpose
        })
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to send email')
      }

      await fetchRequests()
      setSuccess('LOI request sent successfully!')
      handleCloseDialog()
    } catch (err: any) {
      console.error('Error sending LOI:', err)
      setError(err.message || 'Failed to send LOI request')
    } finally {
      setSending(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this request?')) return
    const res = await fetch(`${ADMIN_LOI_URL}?id=${id}`, {
      method: 'DELETE',
      headers: authHeaders
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Failed to delete')
    } else {
      setRequests(requests.filter(r => r.id !== id))
      setSuccess('Request deleted')
    }
  }

  const handleApprove = async (id: string) => {
    const res = await fetch(ADMIN_LOI_URL, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ id, status: 'approved' })
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Failed to approve')
    } else {
      setRequests(requests.map(r => r.id === id ? { ...r, status: 'approved' } : r))
      setSuccess('Request approved')
    }
  }

  const handleSendEmail = async (request: LoiRequest) => {
    setError('')
    setSuccess('')
    setSending(true)

    try {
      const response = await fetch('https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1/send-loi-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubName: request.club_name,
          clubLocation: request.club_location,
          clubEmail: request.club_email,
          memberName: request.member_name,
          memberEmail: request.member_email,
          arrivalDate: request.arrival_date,
          departureDate: request.departure_date,
          purpose: request.purpose
        })
      })

      const responseData = await response.json()
      if (!response.ok) throw new Error(responseData.error || 'Failed to send email')

      await fetch(ADMIN_LOI_URL, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ id: request.id, status: 'sent' })
      })
      setRequests(requests.map(r => r.id === request.id ? { ...r, status: 'sent' } : r))
      setSuccess('LOI email sent successfully!')
    } catch (err: any) {
      setError(err.message || 'Failed to send email')
    } finally {
      setSending(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'success' | 'warning' | 'info'> = {
      pending: 'warning',
      approved: 'success',
      sent: 'info',
      rejected: 'default'
    }
    return colors[status] || 'default'
  }

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      pending: <PendingIcon fontSize="small" />,
      approved: <CheckCircleIcon fontSize="small" />,
      sent: <MailIcon fontSize="small" />,
      rejected: <DeleteIcon fontSize="small" />
    }
    return icons[status] || <PendingIcon fontSize="small" />
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            LOI Requests
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Letters of Introduction for Reciprocal Clubs
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          New LOI Request
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BusinessIcon color="action" />
                <Box>
                  <Typography variant="body2" color="textSecondary">Total Requests</Typography>
                  <Typography variant="h4">{stats.total}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label="⏳" size="small" color="warning" />
                <Box>
                  <Typography variant="body2" color="textSecondary">Pending</Typography>
                  <Typography variant="h4">{stats.pending}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label="✓" size="small" color="info" />
                <Box>
                  <Typography variant="body2" color="textSecondary">Sent</Typography>
                  <Typography variant="h4">{stats.sent}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label="✓" size="small" color="success" />
                <Box>
                  <Typography variant="body2" color="textSecondary">Approved</Typography>
                  <Typography variant="h4">{stats.approved}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              placeholder="Search by member name or club..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              label="Search"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="sent">Sent</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

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

      {/* LOI Requests Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Member</TableCell>
              <TableCell>Club</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Arrival</TableCell>
              <TableCell>Departure</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="textSecondary" sx={{ py: 4 }}>Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="textSecondary" sx={{ py: 4 }}>
                    No LOI requests found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((request) => (
                <TableRow key={request.id} hover>
                  <TableCell>{formatDate(request.created_at)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {request.member_name}
                    </Typography>
                    <a href={`mailto:${request.member_email}`} style={{ textDecoration: 'none' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <MailIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="textSecondary">
                          {request.member_email}
                        </Typography>
                      </Box>
                    </a>
                  </TableCell>
                  <TableCell>{request.club_name}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {request.club_location}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {request.club_region}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDate(request.arrival_date)}</TableCell>
                  <TableCell>{request.departure_date ? formatDate(request.departure_date) : '-'}</TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(request.status)}
                      label={request.status}
                      size="small"
                      color={getStatusColor(request.status)}
                    />
                  </TableCell>
                  <TableCell>
                    {request.status === 'pending' && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        onClick={() => handleApprove(request.id)}
                        sx={{ mr: 1 }}
                      >
                        Approve
                      </Button>
                    )}
                    {(request.status === 'approved' || request.status === 'sent') && (
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => handleSendEmail(request)}
                        disabled={sending}
                        title="Send LOI email"
                      >
                        <SendIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton size="small" color="error" onClick={() => handleDelete(request.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* New LOI Request Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create LOI Request</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} orientation="vertical" sx={{ mt: 2 }}>
            <Step>
              <StepLabel>Member Details</StepLabel>
              <StepContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                  <Autocomplete
                    options={membersList}
                    getOptionLabel={(option) => option.name}
                    renderInput={(params) => (
                      <TextField {...params} label="Select Member" required />
                    )}
                    value={membersList.find(m => m.id === formData.member_id) || null}
                    onChange={(_, newValue) => setFormData({ ...formData, member_id: newValue?.id || '' })}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Box>
                          <Typography variant="body2">{option.name}</Typography>
                          <Typography variant="caption" color="textSecondary">{option.email}</Typography>
                        </Box>
                      </Box>
                    )}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button 
                      variant="contained" 
                      onClick={handleNext}
                      disabled={!formData.member_id}
                    >
                      Next
                    </Button>
                  </Box>
                </Box>
              </StepContent>
            </Step>
            <Step>
              <StepLabel>Club Details</StepLabel>
              <StepContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                  <Autocomplete
                    options={reciprocalClubs}
                    getOptionLabel={(option) => `${option.name} - ${option.location}`}
                    renderInput={(params) => (
                      <TextField {...params} label="Select Club" required />
                    )}
                    value={reciprocalClubs.find(c => c.id === formData.club_id) || null}
                    onChange={(_, newValue) => setFormData({ ...formData, club_id: newValue?.id || '' })}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Box>
                          <Typography variant="body2">{option.name}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {option.location}, {option.country}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button onClick={handleBack}>Back</Button>
                    <Button 
                      variant="contained" 
                      onClick={handleNext}
                      disabled={!formData.club_id}
                    >
                      Next
                    </Button>
                  </Box>
                </Box>
              </StepContent>
            </Step>
            <Step>
              <StepLabel>Visit Details</StepLabel>
              <StepContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                  <TextField
                    fullWidth
                    label="Arrival Date"
                    type="date"
                    value={formData.arrival_date}
                    onChange={(e) => setFormData({ ...formData, arrival_date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Departure Date (optional)"
                    type="date"
                    value={formData.departure_date}
                    onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    fullWidth
                    label="Purpose of Visit"
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    multiline
                    rows={2}
                    placeholder="e.g., Business meetings, Family vacation"
                    required
                  />
                  <TextField
                    fullWidth
                    label="Special Requests (optional)"
                    value={formData.special_requests}
                    onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                    multiline
                    rows={2}
                    placeholder="Any special requirements..."
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button onClick={handleBack}>Back</Button>
                    <Button 
                      variant="contained" 
                      onClick={handleSubmit}
                      disabled={!formData.arrival_date || !formData.purpose || sending}
                    >
                      {sending ? 'Sending...' : 'Send LOI Request'}
                    </Button>
                  </Box>
                </Box>
              </StepContent>
            </Step>
          </Stepper>
        </DialogContent>
      </Dialog>
    </Container>
  )
}
