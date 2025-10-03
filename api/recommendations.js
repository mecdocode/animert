import { getRecommendations } from '../server/services/recommendationService.js'

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Health check
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'OK',
      message: 'Anime Recommendation Terminal API is running',
      timestamp: new Date().toISOString()
    })
  }

  // Main recommendation endpoint
  if (req.method === 'POST') {
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

      // Get recommendations using server logic
      const recommendations = await getRecommendations(req.body)
      
      return res.status(200).json({
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
  }

  // Method not allowed
  return res.status(405).json({
    error: 'METHOD_NOT_ALLOWED',
    message: `Method ${req.method} not allowed`
  })
}
