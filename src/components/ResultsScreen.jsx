import React, { useState, useEffect } from 'react'
import AnimeCard from './AnimeCard'

const ResultsScreen = ({ recommendations, onStartOver, onShowDonation }) => {
  const [displayedCards, setDisplayedCards] = useState([])
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    // Reset displayed cards when recommendations change
    setDisplayedCards([])
    
    // Animate cards appearing one by one
    if (recommendations.length > 0) {
      recommendations.forEach((anime, index) => {
        setTimeout(() => {
          setDisplayedCards(prev => {
            // Prevent duplicates
            if (prev.find(item => item.id === anime.id)) {
              return prev
            }
            return [...prev, anime]
          })
        }, index * 150) // 150ms delay between each card
      })
    }
  }, [recommendations])

  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 500)
    return () => clearInterval(cursorTimer)
  }, [])

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-pixel text-2xl md:text-3xl text-crt-cyan mb-4 text-glow">
          {'>'} RECOMMENDATION PACKET RECEIVED
        </h1>
        <div className="font-terminal text-lg text-crt-green">
          {recommendations.length} ANIME TITLES COMPILED
          <span className={`ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'}`}>_</span>
        </div>
      </div>

      {/* Results Grid */}
      {displayedCards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {displayedCards.map((anime, index) => (
            <AnimeCard 
              key={`${anime.id}-${index}`} 
              anime={anime} 
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="font-terminal text-xl text-crt-amber animate-pulse">
            LOADING RECOMMENDATION DATA<span className="loading-dots"></span>
          </div>
        </div>
      )}

      {/* No Results */}
      {recommendations.length === 0 && displayedCards.length === 0 && (
        <div className="text-center py-12">
          <div className="font-terminal text-xl text-red-400 mb-4">
            {'>'} ERROR: NO RESULTS FOUND
          </div>
          <div className="font-terminal text-lg text-crt-green mb-6">
            Try broadening your search criteria.
          </div>
        </div>
      )}

      {/* Start Over Button */}
      <div className="text-center pt-8 border-t-2 border-crt-green">
        <button
          onClick={onStartOver}
          className="retro-btn btn-glow text-xl px-8 py-4"
        >
          {'<'} RETURN
        </button>
      </div>

      {/* Donation Section */}
      <div className="mt-12 pt-8 border-t-2 border-crt-magenta">
        <div className="text-center space-y-4">
          <div className="font-pixel text-lg text-crt-magenta text-glow">
            MISSION ACCOMPLISHED!
          </div>
          <div className="font-terminal text-sm text-crt-text max-w-2xl mx-auto">
            Hope you found your next anime obsession! If these recommendations hit different, 
            consider throwing some coins my way. College is expensive and ramen isn't free! 😅
          </div>
          <button
            onClick={onShowDonation}
            className="retro-btn btn-glow px-8 py-4 text-xl bg-terminal-dark border-crt-magenta text-crt-magenta hover:bg-crt-magenta hover:text-crt-bg transition-all duration-75"
          >
            💰 SUPPORT THE CAUSE
          </button>
          <div className="font-terminal text-xs text-crt-green">
            "Helping weebs while funding my education - a win-win!"
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center mt-8 text-sm text-crt-amber font-terminal">
        Data sourced from AniList • Powered by OpenRouter AI • Made with ❤️ and caffeine
      </div>
    </div>
  )
}

export default ResultsScreen
