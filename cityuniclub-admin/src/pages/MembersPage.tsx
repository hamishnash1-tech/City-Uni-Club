import { useState, useMemo, useEffect } from 'react'
import { filterMembers } from '../utils/filterMembers'
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
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import MailIcon from '@mui/icons-material/Mail'
import PhoneIcon from '@mui/icons-material/Phone'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import IconButton from '@mui/material/IconButton'
import { FUNCTIONS_URL } from '../services/supabase'
import { useAuth } from '../context/AuthContext'

const MEMBERSHIP_TYPES = [
  'Country',
  'Overseas',
  'Full 35 to 59',
  'Under 35',
  '60 to 64',
  '65 to 69',
  '70 and over',
  'Retired 65 to 69',
  'Honorary',
  'Spousal',
  'Group',
  'Old Stoics',
]

interface Member {
  id: string
  last_name: string | null
  first_name: string | null
  middle_name: string | null
  email: string
  phone_number: string | null
  membership_number: string | null
  membership_type: string | null
  is_active: boolean
  member_since: string | null
  member_until: string | null
}

const emptyForm = {
  last_name: '',
  first_name: '',
  middle_name: '',
  email: '',
  phone_number: '',
  membership_number: '',
  membership_type: 'Country',
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

  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [editMember, setEditMember] = useState<Member | null>(null)
  const [editForm, setEditForm] = useState({ first_name: '', middle_name: '', last_name: '', member_since: '', member_until: '', membership_number: '', membership_type: '', email: '', phone_number: '', is_active: true })
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchMembers() }, [sessionToken])

  const filteredMembers = useMemo(() => filterMembers(members, searchTerm), [members, searchTerm])

  const paginatedMembers = useMemo(() => {
    const start = page * rowsPerPage
    return filteredMembers.slice(start, start + rowsPerPage)
  }, [filteredMembers, page, rowsPerPage])

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage)
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10))
    setPage(0)
  }


  const handleOpenEdit = (member: Member) => {
    setEditMember(member)
    setEditForm({
      first_name: member.first_name || '',
      middle_name: member.middle_name || '',
      last_name: member.last_name || '',
      member_since: member.member_since ? member.member_since.split('T')[0] : '',
      member_until: member.member_until ? member.member_until.split('T')[0] : '',
      membership_number: member.membership_number || '',
      membership_type: member.membership_type || '',
      email: member.email || '',
      phone_number: member.phone_number || '',
      is_active: member.is_active,
    })
    setEditError(null)
  }

  const handleEditSubmit = async () => {
    if (!editMember) return
    setEditSubmitting(true)
    setEditError(null)
    try {
      const res = await fetch(`${FUNCTIONS_URL}/admin-members`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({
          id: editMember.id,
          last_name: editForm.last_name || null,
          first_name: editForm.first_name || null,
          middle_name: editForm.middle_name || null,
          member_since: editForm.member_since || null,
          member_until: editForm.member_until || null,
          membership_number: editForm.membership_number || null,
          membership_type: editForm.membership_type || null,
          email: editForm.email,
          phone_number: editForm.phone_number || null,
          is_active: editForm.is_active,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update member')
      setMembers(prev => prev.map(m => m.id === editMember.id ? { ...m, ...json.member } : m))
      setEditMember(null)
    } catch (e: unknown) {
      setEditError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setEditSubmitting(false)
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
          membership_number: form.membership_number || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create member')
      setMembers(prev => [...prev, json.member].sort((a, b) => (a.last_name ?? '').localeCompare(b.last_name ?? '')))
      setDialogOpen(false)
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Unknown error')
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
              <TableCell>Member Until</TableCell>
              <TableCell>Status</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={32} />
                </TableCell>
              </TableRow>
            ) : paginatedMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
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
                      {[member.first_name, member.middle_name, member.last_name].filter(Boolean).join(' ') || '—'}
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
                    <Typography variant="body2" color="textSecondary">
                      {member.member_until ? new Date(member.member_until).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={member.is_active ? 'Active' : 'Inactive'}
                      size="small"
                      color={member.is_active ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleOpenEdit(member)} title="Edit member">
                      <EditIcon fontSize="small" />
                    </IconButton>
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

      {/* Edit Member Dialog */}
      <Dialog open={!!editMember} onClose={() => setEditMember(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Member — {editMember ? [editMember.first_name, editMember.middle_name, editMember.last_name].filter(Boolean).join(' ') : ''}</DialogTitle>
        <DialogContent>
          {editError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{editError}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="First Name"
                value={editForm.first_name}
                onChange={e => setEditForm(prev => ({ ...prev, first_name: e.target.value }))}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Middle Name"
                value={editForm.middle_name}
                onChange={e => setEditForm(prev => ({ ...prev, middle_name: e.target.value }))}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Last Name"
                value={editForm.last_name}
                onChange={e => setEditForm(prev => ({ ...prev, last_name: e.target.value }))}
                fullWidth
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Email"
                type="email"
                value={editForm.email}
                onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                fullWidth
                required
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Phone Number"
                value={editForm.phone_number}
                onChange={e => setEditForm(prev => ({ ...prev, phone_number: e.target.value }))}
                fullWidth
                placeholder="+44 7700 900000"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Membership Number"
                value={editForm.membership_number}
                onChange={e => setEditForm(prev => ({ ...prev, membership_number: e.target.value }))}
                fullWidth
                placeholder="e.g. 002017"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Membership Type"
                value={editForm.membership_type}
                onChange={e => setEditForm(prev => ({ ...prev, membership_type: e.target.value }))}
                fullWidth
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
                value={editForm.member_since}
                onChange={e => setEditForm(prev => ({ ...prev, member_since: e.target.value }))}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Member Until"
                type="date"
                value={editForm.member_until}
                onChange={e => setEditForm(prev => ({ ...prev, member_until: e.target.value }))}
                fullWidth
                InputLabelProps={{ shrink: true }}
                helperText="Leave blank if ongoing"
              />
            </Grid>
            <Grid size={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editForm.is_active}
                    onChange={e => setEditForm(prev => ({ ...prev, is_active: e.target.checked }))}
                    color="success"
                  />
                }
                label={editForm.is_active ? 'Login enabled' : 'Login disabled'}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditMember(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleEditSubmit}
            disabled={editSubmitting || !editForm.email}
          >
            {editSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Member</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{formError}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Last Name"
                value={form.last_name}
                onChange={set('last_name')}
                fullWidth
                required
                placeholder="Smith"
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
                label="Middle Name"
                value={form.middle_name ?? ''}
                onChange={set('middle_name')}
                fullWidth
                placeholder="Optional"
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
                label="Membership Number"
                value={form.membership_number}
                onChange={set('membership_number')}
                fullWidth
                placeholder="e.g. 002017"
                helperText="Leave blank to assign later"
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
            disabled={submitting || !form.last_name || !form.first_name || !form.email || !form.member_since || !form.password}
          >
            {submitting ? 'Adding...' : 'Add Member'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
