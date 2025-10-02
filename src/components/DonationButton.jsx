import React, { useState } from 'react'

const DonationButton = ({ variant = 'main', onClick }) => {
  const [isGlowing, setIsGlowing] = useState(false)

  const handleClick = () => {
    setIsGlowing(true)
    setTimeout(() => setIsGlowing(false), 300)
    if (onClick) onClick()
  }

  if (variant === 'floating') {
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={handleClick}
          className={`retro-btn btn-glow px-4 py-2 text-sm bg-crt-bg border-crt-magenta text-crt-magenta hover:bg-crt-magenta hover:text-crt-bg transition-all duration-75 ${
            isGlowing ? 'animate-pulse' : ''
          }`}
        >
          💰 FUND MY SURVIVAL
        </button>
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <button
        onClick={handleClick}
        className={`retro-btn btn-glow px-6 py-3 text-lg bg-terminal-dark border-crt-amber text-crt-amber hover:bg-crt-amber hover:text-crt-bg transition-all duration-75 ${
          isGlowing ? 'animate-pulse' : ''
        }`}
      >
        {'>'} SUPPORT THE DEVELOPER
      </button>
    )
  }

  // Main variant
  return (
    <div className="text-center">
      <button
        onClick={handleClick}
        className={`retro-btn btn-glow px-8 py-4 text-xl bg-terminal-dark border-crt-magenta text-crt-magenta hover:bg-crt-magenta hover:text-crt-bg transition-all duration-75 ${
          isGlowing ? 'animate-glitch' : ''
        }`}
      >
        🎓 HELP ME GRADUATE
      </button>
      <div className="font-terminal text-xs text-crt-green mt-2">
        (Your anime taste is impeccable, btw)
      </div>
    </div>
  )
}

export default DonationButton
