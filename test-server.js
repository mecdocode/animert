// Quick test script to verify server logic works locally
import { getRecommendations } from './server/services/recommendationService.js'

const testPreferences = {
  favoriteAnime: "Attack on Titan",
  vibe: "epic",
  genres: ["Action", "Drama"],
  dealbreakers: ["slow"],
  keywords: "intense battles"
}

console.log('🧪 Testing server recommendation logic...')
console.log('Test preferences:', testPreferences)

try {
  const recommendations = await getRecommendations(testPreferences)
  console.log('✅ Success! Got', recommendations.length, 'recommendations')
  console.log('First few titles:', recommendations.slice(0, 3).map(r => r.title.english))
} catch (error) {
  console.error('❌ Test failed:', error.message)
}
