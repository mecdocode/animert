import axios from 'axios'

// Diverse fallback anime recommendations by category
const FALLBACK_RECOMMENDATIONS = {
  popular: ["Attack on Titan", "Death Note", "My Hero Academia", "Demon Slayer", "Jujutsu Kaisen"],
  classics: ["Cowboy Bebop", "Neon Genesis Evangelion", "Akira", "Ghost in the Shell", "Princess Mononoke"],
  hidden_gems: ["Monster", "Steins;Gate", "Parasyte", "Made in Abyss", "Vinland Saga"],
  comedy: ["One Punch Man", "Mob Psycho 100", "Konosuba", "Gintama", "The Devil is a Part-Timer"],
  romance: ["Your Name", "A Silent Voice", "Weathering with You", "Toradora!", "Kaguya-sama"],
  action: ["Fullmetal Alchemist: Brotherhood", "Hunter x Hunter", "Chainsaw Man", "Black Clover", "Fire Force"],
  slice_of_life: ["March Comes in Like a Lion", "Violet Evergarden", "Barakamon", "Silver Spoon", "Mushishi"],
  thriller: ["Tokyo Ghoul", "Psycho-Pass", "Another", "Erased", "Future Diary"]
}

// Function to get diverse fallback recommendations
function getDiverseFallbacks(count = 15) {
  const categories = Object.keys(FALLBACK_RECOMMENDATIONS)
  const selected = []
  const perCategory = Math.floor(count / categories.length)
  const remainder = count % categories.length
  
  // Get equal representation from each category
  categories.forEach((category, index) => {
    const categoryAnime = FALLBACK_RECOMMENDATIONS[category]
    const takeCount = perCategory + (index < remainder ? 1 : 0)
    
    // Shuffle and take required amount
    const shuffled = [...categoryAnime].sort(() => Math.random() - 0.5)
    selected.push(...shuffled.slice(0, takeCount))
  })
  
  // Final shuffle to mix categories
  return selected.sort(() => Math.random() - 0.5).slice(0, count)
}

// OpenRouter AI Service
async function getAIRecommendations(userPreferences, retryCount = 0) {
  const maxRetries = 3
  
  try {
    console.log(`AI request attempt ${retryCount + 1}/${maxRetries + 1}`)
    
    // Generate session ID for diversity
    const sessionId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const prompt = buildPrompt(userPreferences, sessionId)
    
    // Increase temperature for more variety, add randomness
    const temperature = 0.8 + (Math.random() * 0.2) // 0.8-1.0 for more creativity
    
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'meta-llama/llama-3.1-8b-instruct:free',
      messages: [
        {
          role: 'system',
          content: 'You are an anime recommendation expert with extensive knowledge of both popular and obscure anime. Always respond with ONLY a valid JSON array of exactly 15 diverse anime titles in English. Prioritize variety and avoid repetitive suggestions. No explanations, just the JSON array.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: temperature,
      top_p: 0.9, // Add nucleus sampling for more diversity
      frequency_penalty: 0.5, // Reduce repetition
      presence_penalty: 0.3 // Encourage new topics
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://animert-j8j5jspon-mecs-projects-96110a08.vercel.app',
        'X-Title': 'Anime Recommendation Terminal'
      },
      timeout: 45000
    })

    const aiResponse = response.data.choices[0]?.message?.content?.trim()
    
    if (!aiResponse) {
      throw new Error('Empty response from AI')
    }

    // Parse and validate the response
    let titles
    try {
      titles = JSON.parse(aiResponse)
    } catch (parseError) {
      // Try to extract JSON from the response if it's wrapped in text
      const jsonMatch = aiResponse.match(/\[.*\]/s)
      if (jsonMatch) {
        titles = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Invalid JSON response from AI')
      }
    }

    if (!Array.isArray(titles) || titles.length === 0) {
      throw new Error('AI response is not a valid array')
    }

    // Ensure we have strings, remove duplicates, and limit to 15
    const validTitles = [...new Set(titles
      .filter(title => typeof title === 'string' && title.trim().length > 0)
      .map(title => title.trim())
    )].slice(0, 15)

    if (validTitles.length < 5) {
      throw new Error('Insufficient valid titles from AI')
    }

    return validTitles

  } catch (error) {
    console.error(`AI request failed (attempt ${retryCount + 1}):`, error.message)
    console.error('Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    })
    
    if (retryCount < maxRetries) {
      console.log(`Retrying AI request in ${(retryCount + 1) * 2} seconds...`)
      await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000))
      return getAIRecommendations(userPreferences, retryCount + 1)
    }
    
    // If all retries failed, use diverse fallback recommendations
    console.log('All AI attempts failed, using diverse fallback recommendations')
    return getDiverseFallbacks(15)
  }
}

// AniList API Service
async function getAnimeDetails(titles) {
  const query = `
    query ($search: String) {
      Media (search: $search, type: ANIME) {
        id
        title {
          english
          romaji
          native
        }
        coverImage {
          large
          medium
        }
        averageScore
        genres
        seasonYear
        episodes
        status
        format
        description
        startDate {
          year
          month
          day
        }
        studios {
          nodes {
            name
          }
        }
      }
    }
  `

  const results = []
  const failedTitles = []

  for (const title of titles) {
    try {
      const response = await axios.post('https://graphql.anilist.co', {
        query,
        variables: { search: title }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      })

      if (response.data?.data?.Media) {
        const anime = response.data.data.Media
        
        // Ensure we have English title
        const englishTitle = anime.title.english || anime.title.romaji || title
        
        results.push({
          ...anime,
          title: {
            ...anime.title,
            english: englishTitle
          }
        })
      } else {
        failedTitles.push(title)
      }

      // Rate limiting - wait 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100))

    } catch (error) {
      console.error(`Failed to fetch details for "${title}":`, error.message)
      failedTitles.push(title)
    }
  }

  console.log(`Successfully fetched ${results.length} anime details`)
  if (failedTitles.length > 0) {
    console.log(`Failed to fetch details for: ${failedTitles.join(', ')}`)
  }

  if (results.length < 5) {
    throw new Error('ANILIST_DB_ERROR: Could not retrieve sufficient anime details')
  }

  return results
}

// Build AI prompt based on user preferences with randomization for diversity
function buildPrompt(preferences, sessionId = null) {
  const { favoriteAnime, vibe, genres, dealbreakers, keywords } = preferences
  
  // Add randomization elements to prevent identical recommendations
  const diversityPrompts = [
    'Discover fresh anime recommendations based on these preferences:',
    'Find unique anime titles matching these criteria:',
    'Suggest diverse anime series based on the following:',
    'Recommend varied anime titles considering these preferences:',
    'Explore different anime options matching these requirements:'
  ]
  
  const randomPromptStart = diversityPrompts[Math.floor(Math.random() * diversityPrompts.length)]
  let prompt = `${randomPromptStart}\n\n`
  
  if (favoriteAnime?.trim()) {
    prompt += `Reference anime: "${favoriteAnime}" (suggest similar but different titles)\n`
  }
  
  if (vibe) {
    const vibeDescriptions = {
      epic: 'Epic & Intense: Fast-paced action, high stakes, thrilling moments',
      relaxing: 'Relaxing & Heartwarming: Cozy, low-stress stories about characters',
      funny: 'Funny & Lighthearted: Comedy, parody, satirical content',
      dark: 'Dark & Thought-Provoking: Complex themes, psychological depth'
    }
    prompt += `Desired mood: ${vibeDescriptions[vibe] || vibe}\n`
  }
  
  if (genres && genres.length > 0) {
    prompt += `Preferred genres: ${genres.join(', ')}\n`
  }
  
  if (dealbreakers && dealbreakers.length > 0) {
    const dealbreakerDescriptions = {
      slow: 'Avoid slow pacing',
      complex: 'Avoid complex plots', 
      violence: 'Avoid excessive violence/gore',
      old: 'Avoid older animation styles (prefer post-2010)'
    }
    const avoidList = dealbreakers.map(db => dealbreakerDescriptions[db] || db)
    prompt += `Exclude: ${avoidList.join(', ')}\n`
  }
  
  if (keywords?.trim()) {
    prompt += `Themes/elements: "${keywords}"\n`
  }
  
  // Add diversity instructions
  const diversityInstructions = [
    'Include a mix of popular and hidden gems.',
    'Vary between different time periods and studios.',
    'Balance mainstream hits with lesser-known quality series.',
    'Mix different sub-genres and storytelling styles.',
    'Include both classic and modern recommendations.'
  ]
  
  const randomDiversity = diversityInstructions[Math.floor(Math.random() * diversityInstructions.length)]
  prompt += `\nDiversity requirement: ${randomDiversity}\n`
  
  // Add session-based variation if provided
  if (sessionId) {
    prompt += `Session context: ${sessionId.slice(-8)} (ensure variety from previous requests)\n`
  }
  
  prompt += '\nRespond with ONLY a valid JSON array of exactly 15 diverse anime titles in English. No explanations, just the array: ["Title 1", "Title 2", ...]'
  
  return prompt
}

// Main recommendation function
async function getRecommendations(userPreferences) {
  try {
    console.log('Getting AI recommendations...')
    const aiTitles = await getAIRecommendations(userPreferences)
    
    console.log(`Received ${aiTitles.length} titles:`, aiTitles)
    console.log('Fetching anime details from AniList...')
    const animeDetails = await getAnimeDetails(aiTitles)
    
    // Remove duplicates by ID and sort by score (highest first)
    const uniqueResults = animeDetails
      .filter(anime => anime.averageScore) // Only include anime with scores
      .reduce((acc, current) => {
        const existing = acc.find(item => item.id === current.id)
        if (!existing) {
          acc.push(current)
        }
        return acc
      }, [])
      .sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0))
      .slice(0, 15) // Ensure we only return max 15 results
    
    console.log(`Returning ${uniqueResults.length} unique recommendations`)
    
    // If we have very few results, ensure we have at least some recommendations
    if (uniqueResults.length < 3) {
      console.log('Too few results, trying diverse fallback titles...')
      const fallbackTitles = getDiverseFallbacks(10)
      const fallbackDetails = await getAnimeDetails(fallbackTitles)
      const combinedResults = [...uniqueResults, ...fallbackDetails]
        .reduce((acc, current) => {
          const existing = acc.find(item => item.id === current.id)
          if (!existing) {
            acc.push(current)
          }
          return acc
        }, [])
        .sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0))
        .slice(0, 15)
      
      return combinedResults
    }
    
    return uniqueResults
    
  } catch (error) {
    console.error('Error in getRecommendations:', error)
    
    // Last resort: return diverse fallback recommendations with details
    try {
      console.log('Using complete diverse fallback system...')
      const fallbackTitles = getDiverseFallbacks(15)
      const fallbackDetails = await getAnimeDetails(fallbackTitles)
      return fallbackDetails.slice(0, 15)
    } catch (fallbackError) {
      console.error('Even fallback failed:', fallbackError)
      throw new Error('SYSTEM_ERROR: Unable to retrieve any recommendations')
    }
  }
}

// Vercel serverless function handler
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // Health check endpoint
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
      
      // Check if API key is configured (but don't fail completely - we have fallbacks)
      if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'your_openrouter_api_key_here') {
        console.warn('OPENROUTER_API_KEY not configured, will use fallback recommendations')
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
      
      return res.status(200).json({
        success: true,
        recommendations,
        count: recommendations.length,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('Error in recommendations endpoint:', error)
      
      // Since we have robust fallbacks, most errors should be handled gracefully
      // Only return errors for truly unrecoverable situations
      
      if (error.message.includes('SYSTEM_ERROR: Unable to retrieve any recommendations')) {
        return res.status(503).json({
          error: 'SYSTEM_ERROR',
          message: 'All recommendation services are temporarily unavailable. Please try again later.'
        })
      }

      // For any other error, return a generic message but log details
      console.error('Unexpected error details:', {
        message: error.message,
        stack: error.stack,
        code: error.code
      })

      return res.status(500).json({
        error: 'UNEXPECTED_ERROR',
        message: 'An unexpected error occurred. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  // Method not allowed
  return res.status(405).json({
    error: 'METHOD_NOT_ALLOWED',
    message: `Method ${req.method} not allowed`
  })
}
