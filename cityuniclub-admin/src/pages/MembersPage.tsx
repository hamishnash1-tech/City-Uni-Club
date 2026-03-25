import { useState, useMemo, useEffect } from 'react'
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
  TablePagination,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Switch,
  Tooltip,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import MailIcon from '@mui/icons-material/Mail'
import PhoneIcon from '@mui/icons-material/Phone'
import AddIcon from '@mui/icons-material/Add'
import { FUNCTIONS_URL } from '../services/supabase'
import { useAuth } from '../context/AuthContext'

const MEMBERSHIP_TYPES = [
  'Full Membership',
  'Associate Membership',
  'Junior Membership',
  'Senior Membership',
  'Corporate Membership',
]

interface Member {
  id: string
  full_name: string | null
  email: string
  phone_number: string | null
  membership_number: string | null
  membership_type: string | null
  is_active: boolean
  member_since: string | null
  member_until: string | null
}

const emptyForm = {
  full_name: '',
  first_name: '',
  email: '',
  phone_number: '',
  membership_type: 'Full Membership',
  member_since: new Date().toISOString().split('T')[0],
  member_until: '',
  is_active: true,
  password: '',
}

export default function MembersPage() {
  const { sessionToken } = useAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)

  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${sessionToken || localStorage.getItem('admin_token')}`
  }

  const fetchMembers = async () => {
    try {
      const res = await fetch(`${FUNCTIONS_URL}/admin-members`, { headers: authHeaders })
      if (!res.ok) throw new Error('Failed to fetch members')
      const json = await res.json()
      setMembers(json.members ?? [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMembers() }, [sessionToken])

  const filteredMembers = useMemo(() => {
    if (!searchTerm) return members
    const term = searchTerm.toLowerCase()
    return members.filter(m =>
      m.full_name?.toLowerCase().includes(term) ||
      m.email.toLowerCase().includes(term) ||
      m.membership_number?.toLowerCase().includes(term)
    )
  }, [members, searchTerm])

  const paginatedMembers = useMemo(() => {
    const start = page * rowsPerPage
    return filteredMembers.slice(start, start + rowsPerPage)
  }, [filteredMembers, page, rowsPerPage])

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage)
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10))
    setPage(0)
  }

  const handleToggleActive = async (id: string, is_active: boolean) => {
    setTogglingId(id)
    try {
      const res = await fetch(`${FUNCTIONS_URL}/admin-members`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ id, is_active }),
      })
      if (!res.ok) throw new Error('Failed to update member')
      setMembers(prev => prev.map(m => m.id === id ? { ...m, is_active } : m))
    } catch (e: any) {
      setError(e.message)
    } finally {
      setTogglingId(null)
    }
  }

  const handleOpenDialog = () => {
    setForm(emptyForm)
    setFormError(null)
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    setFormError(null)
    setSubmitting(true)
    try {
      const res = await fetch(`${FUNCTIONS_URL}/admin-members`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          ...form,
          phone_number: form.phone_number || null,
          member_until: form.member_until || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create member')
      setMembers(prev => [...prev, json.member].sort((a, b) => (a.full_name ?? '').localeCompare(b.full_name ?? '')))
      setDialogOpen(false)
    } catch (e: any) {
      setFormError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Members Directory
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Chip label={`${filteredMembers.length} members`} color="primary" />
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog}>
            Add Member
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TextField
        fullWidth
        placeholder="Search by name, email, or membership number..."
        value={searchTerm}
        onChange={(e) => { setSearchTerm(e.target.value); setPage(0) }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Membership No.</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Member Since</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={32} />
                </TableCell>
              </TableRow>
            ) : paginatedMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="textSecondary" sx={{ py: 4 }}>
                    {searchTerm ? 'No members found matching your search' : 'No members found'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedMembers.map((member, index) => (
                <TableRow key={member.id} hover>
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {member.full_name || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {member.membership_number || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {member.membership_type || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <a href={`mailto:${member.email}`} style={{ textDecoration: 'none' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <MailIcon fontSize="small" color="action" />
                        {member.email}
                      </Box>
                    </a>
                  </TableCell>
                  <TableCell>
                    {member.phone_number ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PhoneIcon fontSize="small" color="action" />
                        {member.phone_number}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary">—</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {member.member_since ? new Date(member.member_since).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={member.is_active ? 'Disable login' : 'Enable login'}>
                      <Switch
                        checked={member.is_active}
                        onChange={(e) => handleToggleActive(member.id, e.target.checked)}
                        disabled={togglingId === member.id}
                        size="small"
                        color="success"
                      />
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[25, 50, 100]}
        component="div"
        count={filteredMembers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
        }
      />

      {/* Add Member Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Member</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{formError}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Full Name"
                value={form.full_name}
                onChange={set('full_name')}
                fullWidth
                required
                placeholder="John Smith"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="First Name"
                value={form.first_name}
                onChange={set('first_name')}
                fullWidth
                required
                placeholder="John"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Email"
                type="email"
                value={form.email}
                onChange={set('email')}
                fullWidth
                required
                placeholder="john@example.com"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Phone Number"
                value={form.phone_number}
                onChange={set('phone_number')}
                fullWidth
                placeholder="+44 7700 900000"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Membership Type"
                value={form.membership_type}
                onChange={set('membership_type')}
                fullWidth
                required
              >
                {MEMBERSHIP_TYPES.map(t => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Member Since"
                type="date"
                value={form.member_since}
                onChange={set('member_since')}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Member Until"
                type="date"
                value={form.member_until}
                onChange={set('member_until')}
                fullWidth
                InputLabelProps={{ shrink: true }}
                helperText="Leave blank if ongoing"
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Temporary Password"
                type="password"
                value={form.password}
                onChange={set('password')}
                fullWidth
                required
                helperText="The member will use this to log in for the first time"
              />
            </Grid>
            <Grid size={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.is_active}
                    onChange={(e) => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  />
                }
                label="Member can log in to portal"
              />
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', ml: 4, mt: -0.5 }}>
                Member can log in to the website and use mobile apps (Android/iPhone)
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting || !form.full_name || !form.first_name || !form.email || !form.member_since || !form.password}
          >
            {submitting ? 'Adding...' : 'Add Member'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
