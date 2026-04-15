import { useState, useEffect, useCallback } from 'react'
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
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  CircularProgress,
  TablePagination,
  Tooltip,
} from '@mui/material'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import EventIcon from '@mui/icons-material/Event'
import ListAltIcon from '@mui/icons-material/ListAlt'

interface AuditEntry {
  id: string
  booking_type: 'dining' | 'event'
  booking_id: string
  action: string
  previous_value: Record<string, unknown> | null
  new_value: Record<string, unknown> | null
  performed_by_admin_email: string | null
  performed_at: string
}

const ACTION_LABELS: Record<string, string> = {
  status_changed_to_confirmed: 'Confirmed',
  status_changed_to_cancelled: 'Cancelled',
  status_changed_to_rejected: 'Rejected',
  status_changed_to_pending: 'Reset to pending',
  guest_count_updated: 'Guest count updated',
  notes_updated: 'Notes updated',
  member_guest_count_updated: 'Guest count updated (member)',
  member_status_changed_to_cancelled: 'Cancelled (member)',
}

function formatAction(action: string): string {
  return ACTION_LABELS[action] ?? action.replace(/_/g, ' ')
}

function actionColor(action: string): 'success' | 'error' | 'warning' | 'info' | 'default' {
  if (action.includes('confirmed')) return 'success'
  if (action.includes('cancelled') || action.includes('rejected')) return 'error'
  if (action.includes('pending')) return 'warning'
  if (action.includes('updated')) return 'info'
  return 'default'
}

function ChangeSummary({ prev, next }: { prev: Record<string, unknown> | null; next: Record<string, unknown> | null }) {
  if (!prev && !next) return null
  const keys = Array.from(new Set([...Object.keys(prev ?? {}), ...Object.keys(next ?? {})]))
  return (
    <Box sx={{ fontSize: 12, color: 'text.secondary' }}>
      {keys.map(k => {
        const from = prev?.[k]
        const to = next?.[k]
        if (from === to) return null
        return (
          <Box key={k}>
            <span style={{ color: '#888' }}>{k}: </span>
            {from !== undefined && <span style={{ textDecoration: 'line-through', color: '#d32f2f' }}>{String(from)}</span>}
            {from !== undefined && to !== undefined && ' → '}
            {to !== undefined && <span style={{ color: '#388e3c' }}>{String(to)}</span>}
          </Box>
        )
      })}
    </Box>
  )
}

export default function ActivityPage() {
  const { sessionToken } = useAuth()
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [total, setTotal] = useState(0)
  const [typeFilter, setTypeFilter] = useState<'all' | 'dining' | 'event'>('all')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${sessionToken || localStorage.getItem('admin_token')}`
  }), [sessionToken])

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({
        limit: String(rowsPerPage),
        offset: String(page * rowsPerPage),
      })
      if (typeFilter !== 'all') params.set('type', typeFilter)

      const res = await fetch(`${FUNCTIONS_URL}/admin-activity?${params}`, { headers: authHeaders() })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch')
      setEntries(data.entries || [])
      setTotal(data.total ?? 0)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    }
    setLoading(false)
  }, [authHeaders, typeFilter, page, rowsPerPage])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  const handleTypeFilter = (_: React.MouseEvent<HTMLElement>, value: 'all' | 'dining' | 'event' | null) => {
    if (value !== null) {
      setTypeFilter(value)
      setPage(0)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>Activity Log</Typography>
          <Typography variant="body2" color="textSecondary">
            Audit trail for all booking changes
          </Typography>
        </Box>
        <ToggleButtonGroup
          value={typeFilter}
          exclusive
          onChange={handleTypeFilter}
          size="small"
        >
          <ToggleButton value="all">
            <ListAltIcon sx={{ mr: 0.5, fontSize: 18 }} />All
          </ToggleButton>
          <ToggleButton value="dining">
            <RestaurantIcon sx={{ mr: 0.5, fontSize: 18 }} />Dining
          </ToggleButton>
          <ToggleButton value="event">
            <EventIcon sx={{ mr: 0.5, fontSize: 18 }} />Events
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>
      )}

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date & Time</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Change</TableCell>
              <TableCell>Performed By</TableCell>
              <TableCell>Booking ID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography color="textSecondary">No activity found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.id} hover>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {new Date(entry.performed_at).toLocaleString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={entry.booking_type === 'dining' ? <RestaurantIcon /> : <EventIcon />}
                      label={entry.booking_type}
                      size="small"
                      color={entry.booking_type === 'dining' ? 'default' : 'info'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={formatAction(entry.action)}
                      size="small"
                      color={actionColor(entry.action)}
                    />
                  </TableCell>
                  <TableCell>
                    <ChangeSummary prev={entry.previous_value} next={entry.new_value} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color={entry.performed_by_admin_email ? 'textPrimary' : 'textSecondary'}>
                      {entry.performed_by_admin_email || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={entry.booking_id}>
                      <Typography variant="caption" color="textSecondary" sx={{ fontFamily: 'monospace' }}>
                        {entry.booking_id.slice(0, 8)}…
                      </Typography>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0) }}
          rowsPerPageOptions={[25, 50, 100]}
        />
      </TableContainer>
    </Container>
  )
}
