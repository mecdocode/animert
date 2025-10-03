import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import axios from 'axios'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Cache for parsed CSV data
let animeDatabase = null

// Load and parse CSV data
function loadAnimeDatabase() {
  if (animeDatabase) return animeDatabase

  try {
    const csvPath = path.join(__dirname, '../../top_15000_anime.csv')
    const csvData = fs.readFileSync(csvPath, 'utf-8')
    const lines = csvData.split('\n')
    const headers = lines[0].split(',')
    
    animeDatabase = []
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      
      // Parse CSV line (handle commas in quoted fields)
      const values = parseCSVLine(line)
      if (values.length < headers.length) continue
      
      const anime = {}
      headers.forEach((header, index) => {
        anime[header.trim()] = values[index] ? values[index].trim().replace(/^"|"$/g, '') : ''
      })
      
      // Convert numeric fields
      anime.score = parseFloat(anime.score) || 0
      anime.rank = parseInt(anime.rank) || 999999
      anime.popularity = parseInt(anime.popularity) || 999999
      anime.episodes = parseFloat(anime.episodes) || 0
      
      // Clean up fields
      anime.genres = anime.genres ? anime.genres.split(',').map(g => g.trim()) : []
      anime.themes = anime.themes ? anime.themes.split(',').map(t => t.trim()) : []
      
      animeDatabase.push(anime)
    }
    
    console.log(`✅ Loaded ${animeDatabase.length} anime from CSV database`)
    return animeDatabase
    
  } catch (error) {
    console.error('❌ Error loading anime database:', error)
    throw new Error('Failed to load anime database')
  }
}

// Parse CSV line handling quoted fields with commas
function parseCSVLine(line) {
  const values = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      values.push(current)
      current = ''
    } else {
      current += char
    }
  }
  
  values.push(current) // Add the last value
  return values
}

// Smart anime recommendation algorithm
function findBestMatches(userPreferences) {
  const database = loadAnimeDatabase()
  const { favoriteAnime, vibe, genres, dealbreakers, keywords } = userPreferences
  
  console.log('🎯 Finding matches for preferences:', userPreferences)
  
  // Score each anime based on user preferences
  const scoredAnime = database.map(anime => {
    let matchScore = 0
    let reasons = []
    
    // 1. FAVORITE ANIME SIMILARITY (40% weight)
    if (favoriteAnime?.trim()) {
      const favLower = favoriteAnime.toLowerCase()
      const animeName = anime.name.toLowerCase()
      const animeEnglish = anime.english_name.toLowerCase()
      
      // Exact match bonus
      if (animeName.includes(favLower) || animeEnglish.includes(favLower)) {
        matchScore += 40
        reasons.push('Similar to favorite')
      }
      
      // Genre similarity from favorite
      const favoriteGenres = getFavoriteAnimeGenres(favoriteAnime, database)
      const genreOverlap = anime.genres.filter(g => favoriteGenres.includes(g)).length
      matchScore += genreOverlap * 5
    }
    
    // 2. VIBE MATCHING (25% weight)
    if (vibe) {
      const vibeScore = getVibeScore(anime, vibe)
      matchScore += vibeScore * 25
      if (vibeScore > 0.5) reasons.push(`Matches ${vibe} vibe`)
    }
    
    // 3. GENRE PREFERENCES (20% weight)
    if (genres && genres.length > 0) {
      const genreMatches = anime.genres.filter(g => 
        genres.some(userGenre => g.toLowerCase().includes(userGenre.toLowerCase()))
      ).length
      const genreScore = (genreMatches / genres.length) * 20
      matchScore += genreScore
      if (genreMatches > 0) reasons.push(`${genreMatches}/${genres.length} genres match`)
    }
    
    // 4. KEYWORDS/THEMES (10% weight)
    if (keywords?.trim()) {
      const keywordScore = getKeywordScore(anime, keywords)
      matchScore += keywordScore * 10
      if (keywordScore > 0.3) reasons.push('Theme match')
    }
    
    // 5. QUALITY BONUS (5% weight) - prefer highly rated anime
    const qualityScore = Math.min(anime.score / 10, 1) * 5
    matchScore += qualityScore
    
    // DEALBREAKERS (subtract points)
    if (dealbreakers && dealbreakers.length > 0) {
      const penalty = getDealbreakPenalty(anime, dealbreakers)
      matchScore -= penalty
      if (penalty > 0) reasons.push(`Dealbreaker penalty: -${penalty}`)
    }
    
    return {
      ...anime,
      matchScore: Math.max(0, matchScore),
      matchReasons: reasons
    }
  })
  
  // Sort by match score and quality
  const bestMatches = scoredAnime
    .filter(anime => anime.matchScore > 5) // Minimum threshold
    .sort((a, b) => {
      // Primary: match score
      if (Math.abs(a.matchScore - b.matchScore) > 2) {
        return b.matchScore - a.matchScore
      }
      // Secondary: anime score (quality)
      return b.score - a.score
    })
    .slice(0, 15) // Top 15 matches
  
  console.log(`🎯 Found ${bestMatches.length} matches`)
  bestMatches.forEach((anime, i) => {
    console.log(`${i + 1}. ${anime.english_name || anime.name} (Score: ${anime.matchScore.toFixed(1)}, Rating: ${anime.score})`)
  })
  
  return bestMatches
}

// Get genres from user's favorite anime
function getFavoriteAnimeGenres(favoriteTitle, database) {
  const favLower = favoriteTitle.toLowerCase()
  const match = database.find(anime => 
    anime.name.toLowerCase().includes(favLower) || 
    anime.english_name.toLowerCase().includes(favLower)
  )
  return match ? match.genres : []
}

// Calculate vibe matching score
function getVibeScore(anime, vibe) {
  const vibeMap = {
    epic: {
      genres: ['Action', 'Adventure', 'Fantasy', 'Supernatural'],
      themes: ['Military', 'Super Power', 'Magic'],
      keywords: ['battle', 'war', 'power', 'epic', 'hero', 'fight']
    },
    relaxing: {
      genres: ['Slice of Life', 'Comedy', 'Romance'],
      themes: ['School', 'Iyashikei', 'CGDCT'],
      keywords: ['peaceful', 'calm', 'daily', 'life', 'friendship', 'cozy']
    },
    funny: {
      genres: ['Comedy', 'Gag Humor'],
      themes: ['Parody', 'Slapstick'],
      keywords: ['funny', 'comedy', 'laugh', 'humor', 'joke', 'silly']
    },
    dark: {
      genres: ['Thriller', 'Horror', 'Psychological'],
      themes: ['Gore', 'Psychological'],
      keywords: ['dark', 'death', 'psychological', 'mystery', 'thriller']
    }
  }
  
  const vibeData = vibeMap[vibe]
  if (!vibeData) return 0
  
  let score = 0
  
  // Genre matches
  const genreMatches = anime.genres.filter(g => 
    vibeData.genres.some(vg => g.includes(vg))
  ).length
  score += genreMatches * 0.3
  
  // Theme matches
  const themeMatches = anime.themes.filter(t => 
    vibeData.themes.some(vt => t.includes(vt))
  ).length
  score += themeMatches * 0.2
  
  // Synopsis keyword matches
  const synopsis = anime.synopsis.toLowerCase()
  const keywordMatches = vibeData.keywords.filter(k => synopsis.includes(k)).length
  score += keywordMatches * 0.1
  
  return Math.min(score, 1) // Cap at 1.0
}

// Calculate keyword matching score
function getKeywordScore(anime, keywords) {
  const keywordList = keywords.toLowerCase().split(/[,\s]+/).filter(k => k.length > 2)
  const synopsis = anime.synopsis.toLowerCase()
  const title = `${anime.name} ${anime.english_name}`.toLowerCase()
  
  let matches = 0
  keywordList.forEach(keyword => {
    if (synopsis.includes(keyword) || title.includes(keyword)) {
      matches++
    }
  })
  
  return Math.min(matches / keywordList.length, 1)
}

// Calculate dealbreaker penalty
function getDealbreakPenalty(anime, dealbreakers) {
  let penalty = 0
  
  dealbreakers.forEach(dealbreaker => {
    switch (dealbreaker) {
      case 'slow':
        if (anime.genres.includes('Slice of Life') && !anime.genres.includes('Action')) {
          penalty += 10
        }
        break
      case 'violence':
        if (anime.themes.includes('Gore') || anime.rating.includes('R+')) {
          penalty += 15
        }
        break
      case 'complex':
        if (anime.genres.includes('Psychological') || anime.synopsis.toLowerCase().includes('complex')) {
          penalty += 8
        }
        break
      case 'old':
        const year = parseInt(anime.premiered?.split(' ')[1]) || 2024
        if (year < 2010) {
          penalty += 12
        }
        break
    }
  })
  
  return penalty
}

// AniList API Service (reuse existing)
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

  console.log(`✅ Successfully fetched ${results.length} anime details`)
  if (failedTitles.length > 0) {
    console.log(`⚠️ Failed to fetch details for: ${failedTitles.join(', ')}`)
  }

  return results
}

// Main recommendation function
export async function getRecommendations(userPreferences) {
  try {
    console.log('🚀 Starting CSV-based recommendation engine...')
    
    // Find best matches from CSV database
    const bestMatches = findBestMatches(userPreferences)
    
    if (bestMatches.length === 0) {
      throw new Error('No suitable anime found matching your preferences')
    }
    
    // Extract titles for AniList API
    const titles = bestMatches.map(anime => anime.english_name || anime.name)
    
    console.log('📡 Fetching anime details from AniList...')
    const animeDetails = await getAnimeDetails(titles)
    
    // Remove duplicates and sort by score
    const uniqueResults = animeDetails
      .reduce((acc, current) => {
        const existing = acc.find(item => item.id === current.id)
        if (!existing) {
          acc.push(current)
        }
        return acc
      }, [])
      .sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0))
      .slice(0, 15)
    
    console.log(`✅ Returning ${uniqueResults.length} recommendations`)
    return uniqueResults
    
  } catch (error) {
    console.error('❌ Error in CSV recommendation service:', error)
    throw error
  }
}
