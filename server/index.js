import express from 'express'
import cors from 'cors'
import { getRecommendations } from './services/recommendationService.js'

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Anime Recommendation Terminal API is running',
    timestamp: new Date().toISOString()
  })
})

// Main recommendation endpoint
app.post('/api/recommendations', async (req, res) => {
  try {
    console.log('Received recommendation request:', JSON.stringify(req.body, null, 2))
    
    // Check if API key is configured
    if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'your_openrouter_api_key_here') {
      console.error('OPENROUTER_API_KEY not configured')
      return res.status(503).json({
        error: 'CONFIGURATION_ERROR',
        message: 'API service not properly configured. Please contact administrator.'
      })
    }
    
    const { favoriteAnime, vibe, genres, dealbreakers, keywords } = req.body
    
    // Validate input
    const hasInput = favoriteAnime?.trim() || 
                    vibe || 
                    (genres && genres.length > 0) || 
                    (dealbreakers && dealbreakers.length > 0) || 
                    keywords?.trim()

    if (!hasInput) {
      return res.status(400).json({ 
        error: 'INPUT_REQUIRED',
        message: 'At least one field must be filled out' 
      })
    }

    // Get recommendations
    const recommendations = await getRecommendations(req.body)
    
    res.json({
      success: true,
      recommendations,
      count: recommendations.length,
      timestamp: new Date().toISOString()
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

    return res.status(500).json({
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

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: 'API endpoint not found'
  })
})

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`🚀 Anime Recommendation Terminal API running on port ${PORT}`)
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`)
  })
}

// Export for Vercel
export default app
