import { useState, useMemo } from 'react'
import membersData from '../data/members.json'
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
  TablePagination
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import MailIcon from '@mui/icons-material/Mail'
import PhoneIcon from '@mui/icons-material/Phone'

export default function MembersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)

  // Prepare members list
  const members = useMemo(() => {
    return membersData.map((m: any) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      phone: m.phone,
      firstName: m.first_name,
      lastName: m.last_name
    }))
  }, [])

  // Filter members based on search
  const filteredMembers = useMemo(() => {
    if (!searchTerm) return members
    
    const term = searchTerm.toLowerCase()
    return members.filter(member => 
      member.name.toLowerCase().includes(term) ||
      member.email.toLowerCase().includes(term) ||
      member.firstName?.toLowerCase().includes(term) ||
      member.lastName?.toLowerCase().includes(term)
    )
  }, [members, searchTerm])

  // Paginate results
  const paginatedMembers = useMemo(() => {
    const start = page * rowsPerPage
    const end = start + rowsPerPage
    return filteredMembers.slice(start, end)
  }, [filteredMembers, page, rowsPerPage])

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Members Directory
        </Typography>
        <Chip
          label={`${filteredMembers.length} members`}
          color="primary"
        />
      </Box>

      {/* Search Bar */}
      <TextField
        fullWidth
        placeholder="Search by name or email..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value)
          setPage(0)
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {/* Members Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography color="textSecondary" sx={{ py: 4 }}>
                    {searchTerm ? 'No members found matching your search' : 'No members found'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedMembers.map((member, index) => (
                <TableRow
                  key={member.id}
                  hover
                  sx={{
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {member.name}
                    </Typography>
                    {(member.firstName || member.lastName) && (
                      <Typography variant="caption" color="textSecondary">
                        {member.firstName} {member.lastName}
                      </Typography>
                    )}
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
                    {member.phone ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PhoneIcon fontSize="small" color="action" />
                        {member.phone}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
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
    </Container>
  )
}
