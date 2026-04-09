import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  Chip,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

interface DefaultHours {
  day_of_week: number
  open_time: string | null
  close_time: string | null
  is_closed: boolean
}

interface Override {
  id: string
  date: string
  open_time: string | null
  close_time: string | null
  is_closed: boolean
  note: string | null
}

const HARDCODED_DEFAULTS: DefaultHours[] = [
  { day_of_week: 0, open_time: null,    close_time: null,    is_closed: true  }, // Sunday
  { day_of_week: 1, open_time: null,    close_time: null,    is_closed: true  }, // Monday
  { day_of_week: 2, open_time: '09:00', close_time: '17:00', is_closed: false }, // Tuesday
  { day_of_week: 3, open_time: '09:00', close_time: '17:00', is_closed: false }, // Wednesday
  { day_of_week: 4, open_time: '09:00', close_time: '17:00', is_closed: false }, // Thursday
  { day_of_week: 5, open_time: '09:00', close_time: '17:00', is_closed: false }, // Friday
  { day_of_week: 6, open_time: null,    close_time: null,    is_closed: true  }, // Saturday
]

export default function OpeningHoursPage() {
  const [defaults, setDefaults] = useState<DefaultHours[]>(HARDCODED_DEFAULTS)
  const [overrides, setOverrides] = useState<Override[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingOverride, setEditingOverride] = useState<Override | null>(null)
  const [form, setForm] = useState({ date: '', open_time: '12:00', close_time: '22:00', is_closed: false, note: '' })

  useEffect(() => {
    loadDefaults()
    loadOverrides()
  }, [])

  const loadDefaults = async () => {
    const { data } = await supabase.from('opening_hours_defaults').select('*').order('day_of_week')
    if (data && data.length > 0) setDefaults(data)
  }

  const loadOverrides = async () => {
    const { data } = await supabase
      .from('opening_hours_overrides')
      .select('*')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date')
    if (data) setOverrides(data)
  }

  const saveDefault = async (day: DefaultHours) => {
    const update = day.is_closed
      ? { open_time: null, close_time: null, is_closed: true }
      : { open_time: day.open_time, close_time: day.close_time, is_closed: false }

    const { error } = await supabase
      .from('opening_hours_defaults')
      .upsert({ day_of_week: day.day_of_week, ...update })

    if (error) {
      setError('Failed to save: ' + error.message)
    } else {
      setSuccess('Default hours updated')
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  const updateDefault = (day_of_week: number, patch: Partial<DefaultHours>) => {
    setDefaults(prev => prev.map(d => d.day_of_week === day_of_week ? { ...d, ...patch } : d))
  }

  const openAddDialog = () => {
    setEditingOverride(null)
    setForm({ date: '', open_time: '12:00', close_time: '22:00', is_closed: false, note: '' })
    setDialogOpen(true)
  }

  const openEditDialog = (o: Override) => {
    setEditingOverride(o)
    setForm({ date: o.date, open_time: o.open_time || '12:00', close_time: o.close_time || '22:00', is_closed: o.is_closed, note: o.note || '' })
    setDialogOpen(true)
  }

  const saveOverride = async () => {
    if (!form.date) return setError('Date is required')

    const record = {
      date: form.date,
      open_time: form.is_closed ? null : form.open_time,
      close_time: form.is_closed ? null : form.close_time,
      is_closed: form.is_closed,
      note: form.note || null,
      updated_at: new Date().toISOString(),
    }

    let err
    if (editingOverride) {
      ;({ error: err } = await supabase.from('opening_hours_overrides').update(record).eq('id', editingOverride.id))
    } else {
      ;({ error: err } = await supabase.from('opening_hours_overrides').insert(record))
    }

    if (err) {
      setError('Failed to save: ' + err.message)
    } else {
      setSuccess(editingOverride ? 'Override updated' : 'Override added')
      setTimeout(() => setSuccess(''), 3000)
      setDialogOpen(false)
      loadOverrides()
    }
  }

  const deleteOverride = async (id: string) => {
    if (!confirm('Delete this override?')) return
    const { error: err } = await supabase.from('opening_hours_overrides').delete().eq('id', id)
    if (err) setError('Failed to delete: ' + err.message)
    else setOverrides(prev => prev.filter(o => o.id !== id))
  }

  const formatHours = (h: DefaultHours | Override) =>
    h.is_closed ? 'Closed' : (h.open_time && h.close_time ? `${h.open_time} – ${h.close_time}` : 'Closed')

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>Opening Hours</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Default weekly schedule */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Default Weekly Schedule</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Day</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Open</TableCell>
                  <TableCell>Close</TableCell>
                  <TableCell>Save</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {defaults.map((day) => (
                  <TableRow key={day.day_of_week}>
                    <TableCell><strong>{DAY_NAMES[day.day_of_week]}</strong></TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Switch
                          checked={!day.is_closed}
                          onChange={(e) => updateDefault(day.day_of_week, { is_closed: !e.target.checked })}
                          size="small"
                        />
                        <Typography variant="body2" color={day.is_closed ? 'error' : 'success.main'}>
                          {day.is_closed ? 'Closed' : 'Open'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="time"
                        size="small"
                        value={day.open_time || ''}
                        disabled={day.is_closed}
                        onChange={(e) => updateDefault(day.day_of_week, { open_time: e.target.value })}
                        sx={{ width: 130 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="time"
                        size="small"
                        value={day.close_time || ''}
                        disabled={day.is_closed}
                        onChange={(e) => updateDefault(day.day_of_week, { close_time: e.target.value })}
                        sx={{ width: 130 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" onClick={() => saveDefault(day)}>Save</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Date-specific overrides */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Date Overrides</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAddDialog}>Add Override</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Hours</TableCell>
              <TableCell>Note</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {overrides.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography color="textSecondary" sx={{ py: 2 }}>No upcoming overrides</Typography>
                </TableCell>
              </TableRow>
            ) : (
              overrides.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>
                    {new Date(o.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={formatHours(o)}
                      size="small"
                      color={o.is_closed ? 'error' : 'success'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{o.note || '—'}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => openEditDialog(o)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => deleteOverride(o.id)}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editingOverride ? 'Edit Override' : 'Add Date Override'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Date"
              type="date"
              value={form.date}
              onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              disabled={!!editingOverride}
              required
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Switch
                checked={!form.is_closed}
                onChange={(e) => setForm(f => ({ ...f, is_closed: !e.target.checked }))}
              />
              <Typography>{form.is_closed ? 'Closed' : 'Open'}</Typography>
            </Box>
            {!form.is_closed && (
              <>
                <TextField
                  label="Open Time"
                  type="time"
                  value={form.open_time}
                  onChange={(e) => setForm(f => ({ ...f, open_time: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Close Time"
                  type="time"
                  value={form.close_time}
                  onChange={(e) => setForm(f => ({ ...f, close_time: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </>
            )}
            <TextField
              label="Note (optional)"
              value={form.note}
              onChange={(e) => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder="e.g. Bank Holiday, Private Event"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={saveOverride} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
