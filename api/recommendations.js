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

// Function to get user-preference-aware fallback recommendations
function getDiverseFallbacks(count = 15, userPreferences = {}) {
  const { vibe, genres, dealbreakers } = userPreferences
  const categories = Object.keys(FALLBACK_RECOMMENDATIONS)
  let selected = []
  
  // If user has specific preferences, prioritize matching categories
  if (vibe || (genres && genres.length > 0)) {
    const priorityCategories = []
    
    // Map user preferences to categories
    if (vibe === 'funny') priorityCategories.push('comedy')
    if (vibe === 'epic') priorityCategories.push('action', 'popular')
    if (vibe === 'relaxing') priorityCategories.push('slice_of_life', 'romance')
    if (vibe === 'dark') priorityCategories.push('thriller', 'hidden_gems')
    
    if (genres) {
      if (genres.includes('Action')) priorityCategories.push('action')
      if (genres.includes('Comedy')) priorityCategories.push('comedy')
      if (genres.includes('Romance')) priorityCategories.push('romance')
      if (genres.includes('Thriller') || genres.includes('Horror')) priorityCategories.push('thriller')
      if (genres.includes('Slice of Life')) priorityCategories.push('slice_of_life')
    }
    
    // Get more from priority categories
    const uniquePriorities = [...new Set(priorityCategories)]
    if (uniquePriorities.length > 0) {
      const perPriorityCategory = Math.floor(count * 0.7 / uniquePriorities.length)
      
      uniquePriorities.forEach(category => {
        if (FALLBACK_RECOMMENDATIONS[category]) {
          const shuffled = [...FALLBACK_RECOMMENDATIONS[category]].sort(() => Math.random() - 0.5)
          selected.push(...shuffled.slice(0, perPriorityCategory))
        }
      })
      
      // Fill remaining with other categories
      const remainingCount = count - selected.length
      const otherCategories = categories.filter(cat => !uniquePriorities.includes(cat))
      const perOtherCategory = Math.floor(remainingCount / otherCategories.length)
      
      otherCategories.forEach(category => {
        const shuffled = [...FALLBACK_RECOMMENDATIONS[category]].sort(() => Math.random() - 0.5)
        selected.push(...shuffled.slice(0, perOtherCategory))
      })
    }
  }
  
  // If no specific preferences or not enough selected, use equal distribution
  if (selected.length < count * 0.5) {
    selected = []
    const perCategory = Math.floor(count / categories.length)
    const remainder = count % categories.length
    
    categories.forEach((category, index) => {
      const categoryAnime = FALLBACK_RECOMMENDATIONS[category]
      const takeCount = perCategory + (index < remainder ? 1 : 0)
      
      const shuffled = [...categoryAnime].sort(() => Math.random() - 0.5)
      selected.push(...shuffled.slice(0, takeCount))
    })
  }
  
  // Filter out deal-breakers if specified
  if (dealbreakers && dealbreakers.length > 0) {
    // Simple filtering - remove obviously problematic titles based on deal-breakers
    if (dealbreakers.includes('violence')) {
      selected = selected.filter(title => 
        !['Tokyo Ghoul', 'Attack on Titan', 'Chainsaw Man', 'Future Diary', 'Another'].includes(title)
      )
    }
    if (dealbreakers.includes('old')) {
      selected = selected.filter(title => 
        !['Cowboy Bebop', 'Neon Genesis Evangelion', 'Akira', 'Ghost in the Shell'].includes(title)
      )
    }
  }
  
  // Final shuffle and limit
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
    
    // Balance accuracy with controlled variety
    const temperature = 0.6 + (Math.random() * 0.2) // 0.6-0.8 for focused but varied responses
    
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'meta-llama/llama-3.1-8b-instruct:free',
      messages: [
        {
          role: 'system',
          content: 'You are a precise anime recommendation expert. Your goal is ACCURACY - recommend anime that exactly match user preferences. Focus on what they specifically want rather than random variety. Always respond with ONLY a valid JSON array of exactly 15 anime titles in English that closely match their criteria. No explanations, just the JSON array.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: temperature,
      top_p: 0.85, // Slightly more focused sampling
      frequency_penalty: 0.3, // Moderate repetition reduction
      presence_penalty: 0.1 // Light encouragement for variety
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
    
    // If all retries failed, use user-preference-aware fallback recommendations
    console.log('All AI attempts failed, using preference-aware fallback recommendations')
    return getDiverseFallbacks(15, userPreferences)
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

// Build AI prompt based on user preferences with smart accuracy and controlled diversity
function buildPrompt(preferences, sessionId = null) {
  const { favoriteAnime, vibe, genres, dealbreakers, keywords } = preferences
  
  let prompt = 'You are an expert anime curator. Based on these EXACT preferences, recommend 15 anime titles that match what the user specifically wants:\n\n'
  
  // PRIORITY 1: User's favorite anime (most important for accuracy)
  if (favoriteAnime?.trim()) {
    prompt += `🎯 MOST IMPORTANT - User loves: "${favoriteAnime}"\n`
    prompt += `Find anime with similar themes, tone, genre, or storytelling style to "${favoriteAnime}". This is the primary reference point.\n\n`
  }
  
  // PRIORITY 2: Vibe/Mood (second most important)
  if (vibe) {
    const vibeDescriptions = {
      epic: 'Epic & Intense: High-stakes action, intense battles, heroic journeys, adrenaline-pumping scenes',
      relaxing: 'Relaxing & Heartwarming: Cozy atmosphere, feel-good stories, peaceful settings, emotional warmth',
      funny: 'Funny & Lighthearted: Comedy-focused, humorous situations, parody elements, makes you laugh',
      dark: 'Dark & Thought-Provoking: Psychological depth, mature themes, complex moral questions, serious tone'
    }
    prompt += `🎭 REQUIRED VIBE: ${vibeDescriptions[vibe] || vibe}\n`
    prompt += `Every recommendation MUST match this exact mood and feeling.\n\n`
  }
  
  // PRIORITY 3: Specific genres (user's explicit preferences)
  if (genres && genres.length > 0) {
    prompt += `📋 MUST INCLUDE GENRES: ${genres.join(', ')}\n`
    prompt += `Focus heavily on these genres. At least 80% of recommendations should feature these genres prominently.\n\n`
  }
  
  // PRIORITY 4: Deal-breakers (what to absolutely avoid)
  if (dealbreakers && dealbreakers.length > 0) {
    const dealbreakerDescriptions = {
      slow: 'NO slow pacing - must have engaging, well-paced storytelling',
      complex: 'NO overly complex plots - keep stories straightforward and easy to follow',
      violence: 'NO excessive violence or gore - avoid graphic content',
      old: 'NO old animation - only modern animation quality (2010 or newer)'
    }
    const avoidList = dealbreakers.map(db => dealbreakerDescriptions[db] || db)
    prompt += `❌ ABSOLUTELY AVOID: ${avoidList.join(' | ')}\n`
    prompt += `These are deal-breakers. Do NOT recommend anything with these elements.\n\n`
  }
  
  // PRIORITY 5: Keywords/themes (specific elements user wants)
  if (keywords?.trim()) {
    prompt += `🔍 SPECIFIC THEMES WANTED: "${keywords}"\n`
    prompt += `Include anime that specifically feature these themes, elements, or characteristics.\n\n`
  }
  
  // Smart diversity (only add if we have strong preferences to work with)
  const hasStrongPreferences = favoriteAnime?.trim() || vibe || (genres && genres.length > 0)
  if (hasStrongPreferences) {
    prompt += `📊 SMART VARIETY: While staying true to the above preferences, include:\n`
    prompt += `- Mix of popular titles and quality hidden gems\n`
    prompt += `- Different studios and time periods (but matching the vibe)\n`
    prompt += `- Varying episode counts (series, movies, short series)\n\n`
  }
  
  // Add subtle session variation only if we have a session ID
  if (sessionId) {
    const sessionVariation = parseInt(sessionId.slice(-2), 16) % 3
    const variations = [
      'Prioritize highly-rated titles that match the criteria.',
      'Include some lesser-known gems alongside popular matches.',
      'Balance classic favorites with newer releases in the same style.'
    ]
    prompt += `💡 ${variations[sessionVariation]}\n\n`
  }
  
  // Final instruction emphasizing accuracy
  prompt += `🎯 ACCURACY IS KEY: Every recommendation must clearly match the user's stated preferences. Quality over random variety.\n`
  prompt += `Respond with ONLY a JSON array of exactly 15 anime titles in English: ["Title 1", "Title 2", ...]`
  
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
      console.log('Too few results, trying preference-aware fallback titles...')
      const fallbackTitles = getDiverseFallbacks(10, userPreferences)
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
    
    // Last resort: return preference-aware fallback recommendations with details
    try {
      console.log('Using complete preference-aware fallback system...')
      const fallbackTitles = getDiverseFallbacks(15, userPreferences)
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
