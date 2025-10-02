import React, { useState, useEffect } from 'react'

const BootScreen = () => {
  const [currentLine, setCurrentLine] = useState(0)
  const [showCursor, setShowCursor] = useState(true)

  const bootSequence = [
    'ANIME RECOMMENDATION TERMINAL v2.5',
    'Copyright (c) 1995 RetroTech Industries',
    '',
    'Initializing neural networks...',
    'Loading anime database...',
    'Connecting to AniList API...',
    'Establishing AI connection...',
    '',
    'BOOT SEQUENCE COMPLETE',
    'SYSTEM READY',
    '',
    'Welcome to A.R.T.',
    'Awaiting user input...'
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentLine(prev => {
        if (prev < bootSequence.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, 200)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 500)

    return () => clearInterval(cursorTimer)
  }, [])

  return (
    <div className="flex flex-col justify-center items-center h-full text-crt-green font-terminal">
      <div className="text-center space-y-2">
        {bootSequence.slice(0, currentLine + 1).map((line, index) => (
          <div 
            key={index} 
            className={`text-xl ${index === 0 ? 'text-crt-cyan font-pixel text-2xl mb-4' : ''} ${
              index === bootSequence.length - 1 ? 'text-crt-amber' : ''
            }`}
          >
            {line}
            {index === currentLine && showCursor && (
              <span className="animate-blink ml-1">_</span>
            )}
          </div>
        ))}
      </div>
      
      {currentLine >= bootSequence.length - 1 && (
        <div className="mt-8 text-crt-amber animate-flicker">
          <div className="text-center">
            <div className="text-sm">Press any key to continue...</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BootScreen
