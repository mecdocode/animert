import React, { useState, useEffect } from 'react'

const LoadingScreen = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [showCursor, setShowCursor] = useState(true)

  const loadingSteps = [
    { text: '> CONNECTION ESTABLISHED WITH OPENROUTER...', duration: 800 },
    { text: '> ANALYZING USER TASTE PROFILE...', duration: 1000 },
    { text: '> QUERYING ANILIST DATABASE FOR 15 TITLES...', duration: 1200 },
    { text: '> COMPILING RECOMMENDATION PACKET...', duration: 800 },
    { text: '> SUCCESS. LOADING RESULTS...', duration: 600 }
  ]

  useEffect(() => {
    const stepTimer = setTimeout(() => {
      if (currentStep < loadingSteps.length - 1) {
        setCurrentStep(prev => prev + 1)
      }
    }, loadingSteps[currentStep]?.duration || 1000)

    return () => clearTimeout(stepTimer)
  }, [currentStep])

  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const targetProgress = ((currentStep + 1) / loadingSteps.length) * 100
        if (prev < targetProgress) {
          return Math.min(prev + 2, targetProgress)
        }
        return prev
      })
    }, 50)

    return () => clearInterval(progressTimer)
  }, [currentStep])

  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 500)
    return () => clearInterval(cursorTimer)
  }, [])

  const renderProgressBar = () => {
    const filled = Math.floor((progress / 100) * 20)
    const empty = 20 - filled
    return '[' + '█'.repeat(filled) + '-'.repeat(empty) + ']'
  }

  return (
    <div className="flex flex-col justify-center items-center h-full text-crt-green font-terminal">
      <div className="text-center space-y-6 max-w-2xl">
        {/* Loading Steps */}
        <div className="space-y-3">
          {loadingSteps.slice(0, currentStep + 1).map((step, index) => (
            <div 
              key={index} 
              className={`text-xl ${index === currentStep ? 'text-crt-cyan' : 'text-crt-green'}`}
            >
              {step.text}
              {index === currentStep && showCursor && (
                <span className="animate-blink ml-1">_</span>
              )}
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mt-8">
          <div className="text-lg text-crt-amber mb-2">
            PROGRESS: {Math.round(progress)}%
          </div>
          <div className="font-mono text-2xl text-crt-cyan">
            {renderProgressBar()}
          </div>
        </div>

        {/* Additional Loading Effects */}
        <div className="mt-8 space-y-2">
          <div className="text-sm text-crt-green animate-pulse">
            Establishing neural pathways<span className="loading-dots"></span>
          </div>
          <div className="text-sm text-crt-green animate-pulse">
            Parsing anime metadata<span className="loading-dots"></span>
          </div>
        </div>

        {/* Glitch Effect */}
        {currentStep >= 3 && (
          <div className="mt-6">
            <div 
              className="glitch text-2xl text-crt-magenta font-pixel"
              data-text="RECOMMENDATION_ENGINE_ACTIVE"
            >
              RECOMMENDATION_ENGINE_ACTIVE
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoadingScreen
