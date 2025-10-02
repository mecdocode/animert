import React, { useState, useEffect } from 'react'

const QuizScreen = ({ onSubmit, error, onClearError, onShowDonation }) => {
  const [formData, setFormData] = useState({
    favoriteAnime: '',
    vibe: '',
    genres: [],
    dealbreakers: [],
    keywords: ''
  })
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 500)
    return () => clearInterval(cursorTimer)
  }, [])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        onClearError()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, onClearError])

  const vibeOptions = [
    { value: 'epic', label: 'Epic & Intense', desc: 'Fast-paced action, high stakes, thrilling moments' },
    { value: 'relaxing', label: 'Relaxing & Heartwarming', desc: 'Cozy, low-stress stories about characters' },
    { value: 'funny', label: 'Funny & Lighthearted', desc: 'Comedy, parody, and satirical content' },
    { value: 'dark', label: 'Dark & Thought-Provoking', desc: 'Complex themes, psychological depth' }
  ]

  const genreOptions = [
    'Action', 'Adventure', 'Comedy', 'Sci-Fi', 'Fantasy', 
    'Romance', 'Slice of Life', 'Mystery', 'Thriller', 'Horror'
  ]

  const dealbreakerOptions = [
    { value: 'slow', label: 'Slow Pacing', desc: 'I want things to happen quickly' },
    { value: 'complex', label: 'Complex Plots', desc: 'I prefer stories that are easy to follow' },
    { value: 'violence', label: 'Too Much Violence/Gore', desc: 'Not in the mood for graphic content' },
    { value: 'old', label: 'Older Animation Style', desc: 'I prefer modern look (post-2010)' }
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCheckboxChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : field === 'genres' && prev[field].length >= 3
        ? prev[field]
        : [...prev[field], value]
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validation
    const hasInput = formData.favoriteAnime.trim() || 
                    formData.vibe || 
                    formData.genres.length > 0 || 
                    formData.dealbreakers.length > 0 || 
                    formData.keywords.trim()

    if (!hasInput) {
      return // Error will be shown by parent component
    }

    onSubmit(formData)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-pixel text-3xl md:text-4xl text-crt-cyan mb-4 text-glow">
          A.R.T.
        </h1>
        <div className="font-terminal text-xl text-crt-amber">
          v2.5 // Boot Sequence Complete. Awaiting Input.
          <span className={`ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'}`}>_</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Question 1: Favorite Anime */}
        <div className="space-y-3">
          <label className="block font-terminal text-xl text-crt-text">
            <span className="text-crt-magenta">[Q1]</span> The Anchor Point
          </label>
          <p className="font-terminal text-lg text-crt-green mb-4">
            What is one anime you absolutely loved?<br />
            <span className="text-sm text-crt-amber">(This will be our main clue to find more like it.)</span>
          </p>
          <input
            type="text"
            value={formData.favoriteAnime}
            onChange={(e) => handleInputChange('favoriteAnime', e.target.value)}
            className="retro-input w-full max-w-md"
            placeholder="Enter anime title..."
          />
        </div>

        {/* Question 2: Vibe Check */}
        <div className="space-y-3">
          <label className="block font-terminal text-xl text-crt-text">
            <span className="text-crt-magenta">[Q2]</span> The Vibe Check
          </label>
          <p className="font-terminal text-lg text-crt-green mb-4">
            When you sit down to watch, what kind of vibe are you looking for?<br />
            <span className="text-sm text-crt-amber">(Choose the one that feels right for you now.)</span>
          </p>
          <div className="space-y-3">
            {vibeOptions.map((option) => (
              <label key={option.value} className="flex items-start space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="vibe"
                  value={option.value}
                  checked={formData.vibe === option.value}
                  onChange={(e) => handleInputChange('vibe', e.target.value)}
                  className="retro-checkbox mt-1"
                />
                <div className="font-terminal text-lg">
                  <div className="text-crt-text group-hover:text-crt-cyan">
                    {option.label}
                  </div>
                  <div className="text-sm text-crt-green">
                    {option.desc}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Question 3: Genre Palette */}
        <div className="space-y-3">
          <label className="block font-terminal text-xl text-crt-text">
            <span className="text-crt-magenta">[Q3]</span> The Genre Palette
          </label>
          <p className="font-terminal text-lg text-crt-green mb-4">
            Which of these genres usually catch your eye?<br />
            <span className="text-sm text-crt-amber">(Select up to three.)</span>
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {genreOptions.map((genre) => (
              <label key={genre} className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.genres.includes(genre)}
                  onChange={() => handleCheckboxChange('genres', genre)}
                  className="retro-checkbox"
                  disabled={!formData.genres.includes(genre) && formData.genres.length >= 3}
                />
                <span className="font-terminal text-lg text-crt-text group-hover:text-crt-cyan">
                  {genre}
                </span>
              </label>
            ))}
          </div>
          {formData.genres.length >= 3 && (
            <p className="text-sm text-crt-amber font-terminal">
              Maximum 3 genres selected
            </p>
          )}
        </div>

        {/* Question 4: Dealbreakers */}
        <div className="space-y-3">
          <label className="block font-terminal text-xl text-crt-text">
            <span className="text-crt-magenta">[Q4]</span> The Dealbreaker
          </label>
          <p className="font-terminal text-lg text-crt-green mb-4">
            Is there anything you want to actively avoid?<br />
            <span className="text-sm text-crt-amber">(Help us filter out the stuff you don't like.)</span>
          </p>
          <div className="space-y-3">
            {dealbreakerOptions.map((option) => (
              <label key={option.value} className="flex items-start space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.dealbreakers.includes(option.value)}
                  onChange={() => handleCheckboxChange('dealbreakers', option.value)}
                  className="retro-checkbox mt-1"
                />
                <div className="font-terminal text-lg">
                  <div className="text-crt-text group-hover:text-crt-cyan">
                    {option.label}
                  </div>
                  <div className="text-sm text-crt-green">
                    {option.desc}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Question 5: Magic Words */}
        <div className="space-y-3">
          <label className="block font-terminal text-xl text-crt-text">
            <span className="text-crt-magenta">[Q5]</span> The Magic Word
          </label>
          <p className="font-terminal text-lg text-crt-green mb-4">
            If you could describe your perfect show in one or two words, what would they be?<br />
            <span className="text-sm text-crt-amber">(e.g., "mind-game," "found family," "political thriller," "samurai," "redemption")</span>
          </p>
          <input
            type="text"
            value={formData.keywords}
            onChange={(e) => handleInputChange('keywords', e.target.value)}
            className="retro-input w-full max-w-md"
            placeholder="Enter keywords..."
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-center">
            <div className="font-terminal text-lg text-red-400 animate-blink">
              {'>'} ERROR: {error}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="text-center pt-8">
          <button
            type="submit"
            className="retro-btn btn-glow text-xl px-8 py-4"
          >
            {'>'} GENERATE
          </button>
        </div>
      </form>

      {/* Donation Section */}
      <div className="mt-12 pt-8 border-t-2 border-crt-green">
        <div className="text-center space-y-4">
          <div className="font-terminal text-lg text-crt-amber">
            {'>'} ENJOYING THE RETRO VIBES?
          </div>
          <div className="font-terminal text-sm text-crt-text max-w-2xl mx-auto">
            This terminal was coded during countless sleepless nights (and way too much coffee). 
            If you find some epic anime here, consider helping me survive college! 
          </div>
          <button
            onClick={onShowDonation}
            className="retro-btn btn-glow px-6 py-3 text-lg bg-terminal-dark border-crt-amber text-crt-amber hover:bg-crt-amber hover:text-crt-bg transition-all duration-75"
          >
            🎓 FUND MY RAMEN ADDICTION
          </button>
          <div className="font-terminal text-xs text-crt-green">
            (Every donation brings me closer to graduation... maybe)
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuizScreen
