import React, { useState, useEffect } from 'react'
import QuizScreen from './components/QuizScreen'
import LoadingScreen from './components/LoadingScreen'
import ResultsScreen from './components/ResultsScreen'
import BootScreen from './components/BootScreen'
import DonationModal from './components/DonationModal'
import DonationButton from './components/DonationButton'

function App() {
  const [currentScreen, setCurrentScreen] = useState('boot')
  const [quizData, setQuizData] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showDonationModal, setShowDonationModal] = useState(false)

  // Boot sequence
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentScreen('quiz')
    }, 3000) // 3 second boot sequence

    return () => clearTimeout(timer)
  }, [])

  const handleQuizSubmit = async (data) => {
    setQuizData(data)
    setCurrentScreen('loading')
    setIsLoading(true)
    setError(null)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 45000) // 45 second timeout

      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.message || `Server error: ${response.status}`
        throw new Error(errorMessage)
      }

      const result = await response.json()
      
      if (!result.success || !result.recommendations || result.recommendations.length === 0) {
        throw new Error('No recommendations received from server')
      }

      setRecommendations(result.recommendations)
      
      // Simulate loading time for better UX
      setTimeout(() => {
        setCurrentScreen('results')
        setIsLoading(false)
      }, 2000)
      
    } catch (err) {
      console.error('Error getting recommendations:', err)
      
      let errorMessage = 'Failed to get recommendations'
      
      if (err.name === 'AbortError') {
        errorMessage = 'Request timed out. Please try again.'
      } else if (err.message.includes('CONFIGURATION_ERROR')) {
        errorMessage = 'Service temporarily unavailable. Please try again later.'
      } else if (err.message.includes('AI_CONNECTION_ERROR')) {
        errorMessage = 'AI service unavailable. Please try again in a few moments.'
      } else if (err.message.includes('ANILIST_DB_ERROR')) {
        errorMessage = 'Database temporarily unavailable. Please try again.'
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      setIsLoading(false)
      setCurrentScreen('quiz')
    }
  }

  const handleStartOver = () => {
    setCurrentScreen('quiz')
    setQuizData(null)
    setRecommendations([])
    setError(null)
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="crt-monitor w-full max-w-6xl h-screen max-h-[90vh] p-8">
        <div className="terminal-screen w-full h-full p-8 relative overflow-auto">
          {currentScreen === 'boot' && <BootScreen />}
          {currentScreen === 'quiz' && (
            <QuizScreen 
              onSubmit={handleQuizSubmit} 
              error={error}
              onClearError={() => setError(null)}
              onShowDonation={() => setShowDonationModal(true)}
            />
          )}
          {currentScreen === 'loading' && <LoadingScreen />}
          {currentScreen === 'results' && (
            <ResultsScreen 
              recommendations={recommendations}
              onStartOver={handleStartOver}
              onShowDonation={() => setShowDonationModal(true)}
            />
          )}
        </div>
      </div>

      {/* Floating Donation Button */}
      {(currentScreen === 'quiz' || currentScreen === 'results') && (
        <DonationButton 
          variant="floating" 
          onClick={() => setShowDonationModal(true)}
        />
      )}

      {/* Donation Modal */}
      <DonationModal 
        isOpen={showDonationModal}
        onClose={() => setShowDonationModal(false)}
      />
    </div>
  )
}

export default App
