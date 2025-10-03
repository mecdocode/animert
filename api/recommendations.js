import { getRecommendations } from '../server/services/csvRecommendationService.js'

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
      if (error.message.includes('No suitable anime found')) {
        return res.status(404).json({
          error: 'NO_MATCHES_FOUND',
          message: 'No anime found matching your preferences. Try adjusting your criteria.'
        })
      }
      
      if (error.message.includes('Failed to load anime database')) {
        return res.status(503).json({
          error: 'DATABASE_ERROR',
          message: 'Anime database temporarily unavailable. Please try again later.'
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
