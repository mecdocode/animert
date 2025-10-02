import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { getRecommendations } from './services/recommendationService.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Anime Recommendation Terminal API is running' })
})

// Main recommendation endpoint
app.post('/api/recommendations', async (req, res) => {
  try {
    console.log('Received recommendation request:', req.body)
    
    const { favoriteAnime, vibe, genres, dealbreakers, keywords } = req.body
    
    // Validate input
    const hasInput = favoriteAnime?.trim() || 
                    vibe || 
                    (genres && genres.length > 0) || 
                    (dealbreakers && dealbreakers.length > 0) || 
                    keywords?.trim()

    if (!hasInput) {
      return res.status(400).json({ 
        error: 'INPUT REQUIRED',
        message: 'At least one field must be filled out' 
      })
    }

    // Get recommendations
    const recommendations = await getRecommendations(req.body)
    
    res.json({
      success: true,
      recommendations,
      count: recommendations.length
    })

  } catch (error) {
    console.error('Error in recommendations endpoint:', error)
    
    // Handle specific error types
    if (error.message.includes('AI_CONNECTION_ERROR')) {
      return res.status(503).json({
        error: 'AI_CONNECTION_ERROR',
        message: 'Could not generate titles. Please try again later.'
      })
    }
    
    if (error.message.includes('ANILIST_DB_ERROR')) {
      return res.status(503).json({
        error: 'ANILIST_DB_ERROR',
        message: 'Could not retrieve anime details.'
      })
    }

    res.status(500).json({
      error: 'SYSTEM_ERROR',
      message: 'An unexpected error occurred. Please try again.'
    })
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({
    error: 'SYSTEM_ERROR',
    message: 'An unexpected error occurred'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: 'Endpoint not found'
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Anime Recommendation Terminal API running on port ${PORT}`)
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`)
})
