import axios from 'axios'

// OpenRouter AI Service
async function getAIRecommendations(userPreferences, retryCount = 0) {
  const maxRetries = 2
  
  try {
    const prompt = buildPrompt(userPreferences)
    
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'meta-llama/llama-3.3-8b-instruct:free',
      messages: [
        {
          role: 'system',
          content: 'You are an anime recommendation expert. Always respond with ONLY a valid JSON array of exactly 15 anime titles in English. No explanations, no additional text, just the JSON array.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://animert-two.vercel.app',
        'X-Title': 'Anime Recommendation Terminal'
      },
      timeout: 30000
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
    
    if (retryCount < maxRetries) {
      console.log(`Retrying AI request in 1 second...`)
      await new Promise(resolve => setTimeout(resolve, 1000))
      return getAIRecommendations(userPreferences, retryCount + 1)
    }
    
    throw new Error('AI_CONNECTION_ERROR: Could not generate recommendations')
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

// Build AI prompt based on user preferences
function buildPrompt(preferences) {
  const { favoriteAnime, vibe, genres, dealbreakers, keywords } = preferences
  
  let prompt = 'Based on the following preferences, recommend exactly 15 anime titles in English:\n\n'
  
  if (favoriteAnime?.trim()) {
    prompt += `Favorite anime: "${favoriteAnime}"\n`
  }
  
  if (vibe) {
    const vibeDescriptions = {
      epic: 'Epic & Intense: Fast-paced action, high stakes, thrilling moments',
      relaxing: 'Relaxing & Heartwarming: Cozy, low-stress stories about characters',
      funny: 'Funny & Lighthearted: Comedy, parody, satirical content',
      dark: 'Dark & Thought-Provoking: Complex themes, psychological depth'
    }
    prompt += `Desired vibe: ${vibeDescriptions[vibe] || vibe}\n`
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
    prompt += `Things to avoid: ${avoidList.join(', ')}\n`
  }
  
  if (keywords?.trim()) {
    prompt += `Keywords/themes: "${keywords}"\n`
  }
  
  prompt += '\nRespond with ONLY a JSON array of exactly 15 anime titles in English. Example format: ["Attack on Titan", "Death Note", "Your Name", ...]'
  
  return prompt
}

// Main recommendation function
async function getRecommendations(userPreferences) {
  try {
    console.log('Getting AI recommendations...')
    const aiTitles = await getAIRecommendations(userPreferences)
    
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
    return uniqueResults
    
  } catch (error) {
    console.error('Error in getRecommendations:', error)
    throw error
  }
}

export {
  getRecommendations
}
