// Quick test for CSV recommendation service
import { getRecommendations } from './server/services/csvRecommendationService.js'

const testPreferences = {
  favoriteAnime: "Attack on Titan",
  vibe: "epic",
  genres: ["Action", "Drama"],
  dealbreakers: ["slow"],
  keywords: "intense battles"
}

console.log('🧪 Testing CSV recommendation service...')
console.log('Test preferences:', testPreferences)

try {
  const recommendations = await getRecommendations(testPreferences)
  console.log('✅ Success! Got', recommendations.length, 'recommendations')
  console.log('First few titles:')
  recommendations.slice(0, 5).forEach((anime, i) => {
    console.log(`${i + 1}. ${anime.title.english} (Score: ${anime.averageScore})`)
  })
} catch (error) {
  console.error('❌ Test failed:', error.message)
}
