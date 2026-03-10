import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'
import {
  Container,
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert
} from '@mui/material'

// Initialize Supabase client
const supabaseUrl = 'https://myfoyoyjtkqthjjvabmn.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15Zm95b3lqdGtxdGhqanZhYm1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMDI5NDAsImV4cCI6MjA4Nzc3ODk0MH0._OhoEKRYAZ0C7oon9e_WSj7p47pJlWQmqBgx2CtBtdg'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Sign in with Supabase Auth
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) {
        throw new Error(signInError.message)
      }

      // Check if user has admin role
      const userRole = data.user.user_metadata?.role || 'user'
      
      if (userRole !== 'admin') {
        await supabase.auth.signOut()
        throw new Error('Access denied: Admin access required')
      }

      // Store admin session
      localStorage.setItem('admin_session', JSON.stringify({
        email: data.user.email,
        role: userRole,
        loggedIn: new Date().toISOString()
      }))

      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom color="primary">
            City University Club
          </Typography>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Admin Portal
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mt: 2 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            
            <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: 'background.default' }}>
              <Typography variant="caption" fontWeight={500} gutterBottom>
                Demo Credentials:
              </Typography>
              <Typography variant="caption" display="block">
                Email: admin@cityuniversityclub.co.uk
              </Typography>
              <Typography variant="caption" display="block">
                Password: admin123
              </Typography>
            </Paper>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}
