import { useState, useMemo, useEffect } from 'react'
import reciprocalClubsData from '../data/reciprocal-clubs.json'
import { useAuth } from '../context/AuthContext'
import { FUNCTIONS_URL } from '../services/supabase'
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
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  TablePagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import MailIcon from '@mui/icons-material/Mail'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CloseIcon from '@mui/icons-material/Close'
import HistoryIcon from '@mui/icons-material/History'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'

interface ReciprocalClub {
  id: string
  name: string
  location: string
  country: string
  region: string
  address: string
  email: string
  notes: string
}

interface LoiRequest {
  id: string
  member_name: string
  member_email: string
  club_name: string
  club_region: string
  arrival_date: string
  departure_date?: string
  purpose: string
  created_at: string
  email_sent: boolean
}

export default function ReciprocalClubsPage() {
  const { sessionToken } = useAuth()
  const [clubs, setClubs] = useState<ReciprocalClub[]>(reciprocalClubsData)
  const [requests, setRequests] = useState<LoiRequest[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [regionFilter, setRegionFilter] = useState<string>('all')
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [editingClub, setEditingClub] = useState<ReciprocalClub | null>(null)
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)
  const [success, setSuccess] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)

  useEffect(() => {
    fetch(`${FUNCTIONS_URL}/admin-loi`, {
      headers: { 'Authorization': `Bearer ${sessionToken}` }
    })
      .then(r => r.json())
      .then(data => setRequests((data.requests || []).map((r: any) => ({
        id: r.id,
        member_name: r.members?.full_name || 'Unknown',
        member_email: r.members?.email || '',
        club_name: r.reciprocal_clubs?.name || '',
        club_region: r.reciprocal_clubs?.region || '',
        arrival_date: r.arrival_date,
        departure_date: r.departure_date,
        purpose: r.purpose,
        created_at: r.created_at,
        email_sent: r.status === 'sent'
      }))))
      .catch(console.error)
  }, [sessionToken])

  // Get unique regions for filter
  const regions = useMemo(() => {
    const uniqueRegions = Array.from(new Set(clubs.map(c => c.region).filter(Boolean)))
    return uniqueRegions.sort()
  }, [clubs])

  // Filter clubs
  const filteredClubs = useMemo(() => {
    let filtered = clubs
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.location.toLowerCase().includes(term) ||
        c.country.toLowerCase().includes(term) ||
        c.region.toLowerCase().includes(term)
      )
    }
    
    // Filter by region
    if (regionFilter !== 'all') {
      filtered = filtered.filter(c => c.region === regionFilter)
    }
    
    return filtered.sort((a, b) => a.name.localeCompare(b.name))
  }, [clubs, searchTerm, regionFilter])

  const handleOpenHistoryDialog = () => {
    setOpenHistoryDialog(true)
  }

  const handleCloseHistoryDialog = () => {
    setOpenHistoryDialog(false)
  }

  const handleEditClub = (club: ReciprocalClub) => {
    setEditingClub(club)
    setOpenEditDialog(true)
  }

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false)
    setEditingClub(null)
  }

  const handleSaveClub = () => {
    if (!editingClub) return
    
    // Update club in state
    setClubs(clubs.map(c => c.id === editingClub.id ? editingClub : c))
    setSuccess(`Updated email for ${editingClub.name}`)
    setTimeout(() => setSuccess(''), 3000)
    handleCloseEditDialog()
  }

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email)
    setCopiedEmail(email)
    setTimeout(() => setCopiedEmail(null), 2000)
  }

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Reciprocal Clubs
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Directory of {clubs.length} reciprocal clubs worldwide
        </Typography>
      </Box>

      {/* LOI History Card */}
      <Card
        sx={{
          mb: 4,
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 6
          },
          border: requests.length > 0 ? '2px solid' : '1px solid',
          borderColor: requests.length > 0 ? 'primary.main' : 'divider'
        }}
        onClick={handleOpenHistoryDialog}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <HistoryIcon color="primary" sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h6">
                  LOI Request History
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {requests.length} request{requests.length !== 1 ? 's' : ''} from members
                </Typography>
              </Box>
            </Box>
            <Button variant="outlined" endIcon={<SearchIcon />}>
              View History
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Club Directory */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Club Directory ({filteredClubs.length} clubs)
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              placeholder="Search by club name, location, or country..."
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
              <InputLabel>Region</InputLabel>
              <Select
                value={regionFilter}
                label="Region"
                onChange={(e) => setRegionFilter(e.target.value)}
              >
                <MenuItem value="all">All Regions</MenuItem>
                {regions.map((region) => (
                  <MenuItem key={region} value={region}>
                    {region}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {copiedEmail && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setCopiedEmail(null)}>
          Email copied to clipboard!
        </Alert>
      )}

      {/* Clubs Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Club Name</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Country</TableCell>
              <TableCell>Region</TableCell>
              <TableCell>Secretary Email</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredClubs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="textSecondary" sx={{ py: 4 }}>
                    No clubs found matching your search
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredClubs
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((club) => (
                  <TableRow key={club.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {club.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{club.location || '-'}</TableCell>
                    <TableCell>{club.country || '-'}</TableCell>
                    <TableCell>
                      <Chip label={club.region} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      {club.email ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <a href={`mailto:${club.email}`} style={{ textDecoration: 'none', flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <MailIcon fontSize="small" color="action" />
                              <Typography variant="body2">{club.email}</Typography>
                            </Box>
                          </a>
                          <IconButton
                            size="small"
                            onClick={() => handleCopyEmail(club.email)}
                            title="Copy email address"
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="textSecondary" fontStyle="italic">
                          No email
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditClub(club)}
                        title="Edit email"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[25, 50, 100]}
          component="div"
          count={filteredClubs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* LOI History Dialog */}
      <Dialog open={openHistoryDialog} onClose={handleCloseHistoryDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">LOI Request History</Typography>
            <IconButton onClick={handleCloseHistoryDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {requests.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <HistoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="textSecondary">
                No LOI requests yet
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Member</TableCell>
                    <TableCell>Reciprocal Club</TableCell>
                    <TableCell>Region</TableCell>
                    <TableCell>Arrival</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>{formatDate(request.created_at)}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {request.member_name}
                          </Typography>
                          <a href={`mailto:${request.member_email}`} style={{ textDecoration: 'none' }}>
                            <Typography variant="caption" color="textSecondary">
                              {request.member_email}
                            </Typography>
                          </a>
                        </TableCell>
                        <TableCell>{request.club_name}</TableCell>
                        <TableCell>
                          <Chip label={request.club_region} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>{formatDate(request.arrival_date)}</TableCell>
                        <TableCell>
                          <Chip
                            label="Sent"
                            size="small"
                            color="success"
                            icon={<MailIcon />}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHistoryDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Club Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit Club Details
          {editingClub && (
            <Typography variant="body2" color="textSecondary">
              {editingClub.name}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {editingClub && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <TextField
                fullWidth
                label="Club Name"
                value={editingClub.name}
                onChange={(e) => setEditingClub({ ...editingClub, name: e.target.value })}
              />
              
              <TextField
                fullWidth
                label="Location / City"
                value={editingClub.location}
                onChange={(e) => setEditingClub({ ...editingClub, location: e.target.value })}
              />
              
              <TextField
                fullWidth
                label="Country"
                value={editingClub.country}
                onChange={(e) => setEditingClub({ ...editingClub, country: e.target.value })}
              />
              
              <TextField
                fullWidth
                label="Region"
                value={editingClub.region}
                onChange={(e) => setEditingClub({ ...editingClub, region: e.target.value.toUpperCase() })}
              />
              
              <TextField
                fullWidth
                label="Address"
                value={editingClub.address}
                onChange={(e) => setEditingClub({ ...editingClub, address: e.target.value })}
                multiline
                rows={2}
              />
              
              <TextField
                fullWidth
                label="Secretary / Contact Email"
                type="email"
                value={editingClub.email}
                onChange={(e) => setEditingClub({ ...editingClub, email: e.target.value })}
                placeholder="secretary@club.com"
                helperText="Leave empty if not publicly listed"
              />
              
              <TextField
                fullWidth
                label="Notes"
                value={editingClub.notes}
                onChange={(e) => setEditingClub({ ...editingClub, notes: e.target.value })}
                multiline
                rows={2}
                placeholder="e.g., evenings only, dress code, etc."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveClub} 
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={!editingClub?.name}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
