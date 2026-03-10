import { Typography, Paper, Box } from '@mui/material'

export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          {title} management coming soon...
        </Typography>
      </Paper>
    </Box>
  )
}
