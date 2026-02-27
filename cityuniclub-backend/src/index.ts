import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import authRoutes from './routes/auth.js'
import membersRoutes from './routes/members.js'
import eventsRoutes from './routes/events.js'
import diningRoutes from './routes/dining.js'
import reciprocalRoutes from './routes/reciprocal.js'
import newsRoutes from './routes/news.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/members', membersRoutes)
app.use('/api/events', eventsRoutes)
app.use('/api/dining', diningRoutes)
app.use('/api/reciprocal', reciprocalRoutes)
app.use('/api/news', newsRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`)
})

export default app
